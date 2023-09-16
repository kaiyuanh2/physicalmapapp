import sys, json
import pandas as pd
import fiona
from fiona import Geometry, Feature, Properties
from shapely.geometry import mapping, shape

def read_in():
    lines = sys.stdin.readlines()
    for i in range(len(lines)):
        lines[i] = lines[i].strip()
    return lines

if __name__ == '__main__':
    print('Running Python Script')
    line = read_in()
    final_path = '../ca_custom/' + line[1] + '.shp'
    sd_df = pd.read_csv('./public/school_district_codes_merged_nonan.csv', converters={i: str for i in range(10)})
    ins_df = pd.read_csv(line[0], index_col=0, converters={i: str for i in range(4)})
    ins_df['data_scaled'] = ((ins_df['data'] - ins_df['data'].min()) / (ins_df['data'].max() - ins_df['data'].min())) * 100
    ins_df.head()

    with fiona.open("./public/shp/ca_school_district_base.shp") as src:
        schema = src.schema.copy()
        schema['properties']['data'] = 'float'
        schema['properties']['scaled'] = 'float'
        crs = src.crs
    
        with fiona.open(final_path, 'w', 'ESRI Shapefile', schema, crs) as output:
            for elem in src:
                # print(elem['properties']['DistrictNa'])
                if len(sd_df[sd_df['CDSCODE'] == elem['properties']['CDSCode']]) > 0:
                    leaid = sd_df[sd_df['CDSCODE'] == elem['properties']['CDSCode']]['LEAID'].iloc()[0]
                    if len(ins_df[ins_df['LEAID'] == leaid]['data']) > 0:
                        elem['properties']['data'] = ins_df[ins_df['LEAID'] == leaid]['data'].iloc()[0]
                        elem['properties']['scaled'] = ins_df[ins_df['LEAID'] == leaid]['data_scaled'].iloc()[0]
                    else:
                        elem['properties']['data'] = -1.0
                        elem['properties']['scaled'] = -1.0
                else:
                    elem['properties']['data'] = -1.0
                    elem['properties']['scaled'] = -1.0
                output.write({'properties': elem['properties'], 'geometry': mapping(shape(elem['geometry']))})

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