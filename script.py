import sys, json, requests
import pandas as pd
import fiona
from fiona import Geometry, Feature, Properties
from shapely.geometry import mapping, shape
import boto3
from botocore.exceptions import ClientError

class FileFormatError(Exception):
    def __init__(self, f, *args):
        super().__init__(args)
        self.fname = f

    def __str__(self):
        return f'The file "{self.fname}" is not a valid custom dataset file or missing! Please follow the format guide and try again.'
    
class DatasetExistsError(Exception):
    def __init__(self, d, *args):
        super().__init__(args)
        self.dname = d

    def __str__(self):
        return f'The name of the uploaded dataset "{self.dname}" already exists! Please use a new name and try again.'

def read_in():
    lines = sys.stdin.readlines()
    for i in range(len(lines)):
        lines[i] = lines[i].strip()
    return lines

def get_layer_xml(lname):
    return f"""
    <featureType><name>{lname}</name>
            <nativeBoundingBox>
                <minx>-13849212.31989677</minx>
                <maxx>-12705028.292196771</maxx>
                <miny>3833655.391757408</miny>
                <maxy>5162403.053757408</maxy>
                <crs>EPSG:3857</crs>
            </nativeBoundingBox>
            <latLonBoundingBox>
                <minx>-124.40959099979645</minx>
                <maxx>-114.13121100051302</maxx>
                <miny>32.53432592843067</miny>
                <maxy>42.00950300056604</maxy>
                <crs>EPSG:3857</crs>
            </latLonBoundingBox>
        </featureType>
"""

if __name__ == '__main__':
    print('Running Python Script')
    line = read_in()

    with open('./public/custom.json', 'r') as json_file:
        json_str = json_file.read()
        json_body = json.loads(json_str)
        if line[1] in json_body.keys():
            raise DatasetExistsError(line[1])

    final_path = '../ca_custom/' + line[1] + '.shp'
    sd_df = pd.read_csv('./public/school_district_codes_merged_nonan.csv', converters={i: str for i in range(10)})
    ins_df = None
    try:
        ins_df = pd.read_csv(line[0], index_col=0, dtype={'leaid': str, 'cdscode': str, 'data': float})
    except:
        try:
            ins_df = pd.read_excel(line[0], index_col=0, dtype={'leaid': str, 'cdscode': str, 'data': float})
        except:
            f_name = line[0].split('/')[-1]
            raise FileFormatError(f_name)
    
    if ins_df is None:
        f_name = line[0].split('/')[-1]
        raise FileFormatError(f_name)
    
    if not ('cdscode' in ins_df.columns or 'leaid' in ins_df.columns):
        f_name = line[0].split('/')[-1]
        raise FileFormatError(f_name)
    
    ins_df['data_scaled'] = ((ins_df['data'] - ins_df['data'].min()) / (ins_df['data'].max() - ins_df['data'].min())) * 100
    # ins_df.head()

    with fiona.open("./public/shp/ca_school_district_base.shp") as src:
        schema = src.schema.copy()
        schema['properties']['data'] = 'float'
        schema['properties']['scaled'] = 'float'
        crs = src.crs
    
        with fiona.open(final_path, 'w', 'ESRI Shapefile', schema, crs) as output:
            flag = False
            if 'cdscode' in ins_df.columns:
                flag = True
            for elem in src:
                # print(elem['properties']['DistrictNa'])
                cdscode = elem['properties']['CDSCode']
                if len(sd_df[sd_df['CDSCODE'] == cdscode]) > 0:
                    # CDS Code is first matched if exists, LEAID otherwise
                    if flag:
                        if len(ins_df[ins_df['cdscode'] == cdscode]['data']) > 0:
                            elem['properties']['data'] = ins_df[ins_df['cdscode'] == cdscode]['data'].iloc()[0]
                            elem['properties']['scaled'] = ins_df[ins_df['cdscode'] == cdscode]['data_scaled'].iloc()[0]
                        else:
                            elem['properties']['data'] = -1.0
                            elem['properties']['scaled'] = -1.0
                    else:
                        leaid = sd_df[sd_df['CDSCODE'] == elem['properties']['CDSCode']]['LEAID'].iloc()[0]
                        if len(ins_df[ins_df['leaid'] == leaid]['data']) > 0:
                            elem['properties']['data'] = ins_df[ins_df['leaid'] == leaid]['data'].iloc()[0]
                            elem['properties']['scaled'] = ins_df[ins_df['leaid'] == leaid]['data_scaled'].iloc()[0]
                        else:
                            elem['properties']['data'] = -1.0
                            elem['properties']['scaled'] = -1.0
                else:
                    elem['properties']['data'] = -1.0
                    elem['properties']['scaled'] = -1.0
                output.write({'properties': elem['properties'], 'geometry': mapping(shape(elem['geometry']))})

    if line[2] == 'dev':
        url = 'http://localhost:8080/geoserver/rest/workspaces/california/datastores/ca_custom/featuretypes'
        auth = ('admin', 'geoserver')
    else:
        url = 'http://ec2-54-176-149-48.us-west-1.compute.amazonaws.com:8080/geoserver/rest/workspaces/california/datastores/ca_custom/featuretypes'

        secret_name = "geoserver"
        region_name = "us-west-1"
        session = boto3.session.Session()
        client = session.client(
            service_name='secretsmanager',
            region_name=region_name
        )

        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=secret_name
            )
        except ClientError as e:
            # For a list of exceptions thrown, see
            # https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
            raise e
        
        secret = get_secret_value_response['SecretString']
        secret_dict = json.loads(secret)
        auth = (secret_dict['username'], secret_dict['password'])

    headers = {'Content-Type': 'text/xml'}
    layer_xml = get_layer_xml(line[1])
    r = requests.post(url, headers=headers, auth=auth, data=layer_xml)
    print(r.text)

    with open('./public/custom.json', 'r') as json_file:
        json_str = json_file.read()
        json_body = json.loads(json_str)
        # print(json_body)
        json_body.update({line[1]: [ins_df['data'].min(), ins_df['data'].max()]})
        new_json = json.dumps(json_body)

    with open('./public/custom.json', 'w') as json_file:
        json_file.write(new_json)

    # with fiona.open("output_insurance.shp") as src:
    #     print(src.schema)
    #     a = 0
    #     for elem in src:
    #         print(elem['properties']['data'])
    #         print(elem['properties']['scaled'])
    #         print()
    #         a += 1
    #         if a > 5:
    #             break