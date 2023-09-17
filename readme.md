### *All configuration files listed below should be in [pftconfig](https://github.com/kaiyuanh2/pftappconfig) repository.*

# Part 1: How to run the app locally

## Step 1: Install & Run GeoServer
1. Install GeoServer
2. - *(For macOS & Linux)* Open the terminal, navigate to the directory of GeoServer, then navigate to `bin` directory, run `./startup.sh` to launch Geoserver
 - - *(For Windows)* Go to `bin` directory in the directory of GeoServer, open `startup.bat` to launch Geoserver
3. Usually the link to geoserver is `localhost:8080/geoserver/web`, open this link in the browser to access GeoServer Web Portal

## Step 2: Configure GeoServer
1. On the GeoServer webpage, use the default account `admin` and default password `geoserver` to log in. (Not safe but okay when testing locally)
2. Unzip `ca_exported.zip` into a directory
3. Add a new workspace, then add a store under the new workspace
4. When adding the new store, choose "Directory of spatial files (shapefiles)", then choose the unzipped `ca_exported` directory.
5. Add layers for all 8 features in California PFT, the add layer for insurance (for custom upload testing purposes)
6. Upload `school_districts.xml` and `custom.xml` to "Styles"
7. Copy all `.ftl` files in the root directory of `pftconfig` to each `(GeoServer directory) / data_dir / workspaces / (Workspace Name) / (Store Name) / (Layer Name of PFT maps)`, they are template for showing the data in PFT map interactions
8. Copy all `.ftl` files in `pftconfig/custom_ftl` to each `(GeoServer directory) / data_dir / workspaces / (Workspace Name) / (Store Name) / (Layer Name of Custom maps)`, they are template for showing the data in custom maps
9. Check the code in `map.js` and `map_custom.js`, make sure `dev` is set to `true` (enable local development mode), and double check the links to GeoServer layers, make sure they work

## Step 3: Final Preparations
1. Open the terminal, navigate to the directory of the web app, run `npm install` to install all necessary packages
2. Check the code in `map.js` and `map_custom.js`, make sure `dev` is set to `true` (enable local development mode)

## Step 4: Run Web App Locally
1. Use pip to install required Python packages: Pandas, Fiona, and Shapely
2. Open the terminal, navigate to the directory of the web app
3. Run `nodemon app.js` (use nodemon instead of node to make app restart automatically when files change)
4. The link should be `localhost:3000` to access from web browsers (if the port 3000 is not occupied), the terminal will display debug output

# Part 2: How to run the app on AWS instance

## Step 1: AWS File Preparation
*Check the code files to make sure `dev` is set to `false`!*
1. Use the key file to log in the AWS instance using sftp. `sftp -i KaiYuan.pem ubuntu@ec2-54-176-149-48.us-west-1.compute.amazonaws.com`
2. In the local machine, make the directories containing .shp files into zipped (.zip) files, then navigate to the directory of .zip files in sftp console using `lcd`
3. Upload the .zip files into AWS instance using `put`, then leave sftp
4. Use the key file to log in the AWS instance using ssh. `ssh -i KaiYuan.pem ubuntu@ec2-54-176-149-48.us-west-1.compute.amazonaws.com`, a Ubuntu console will appear
5. Unzip the .zip files on AWS instance using `unzip` command

## Step 2: Install and Configure GeoServer on AWS Instance
1. Install GeoServer on AWS instance following this [tutorial](https://docs.geoserver.org/latest/en/user/installation/linux.html) for Linux
2. Change the password of GeoServer immediately (for security concerns): Go to GeoServer Web Portal, click "Users, Groups, Roles", then click "Users/Groups" tab, click "admin" user and change the password in the user page
3. Follow 3-8 in Step 2 of "Running Locally"

## Step 3: Sync Code Files from GitHub
*Generating a token for GitHub access is required before you proceed into this step. Log into a GitHub account with access to this repository and go to this [link](https://github.com/settings/tokens) to generate a token*
1. Install GitHub CLI following this [tutorial](https://github.com/cli/cli/blob/trunk/docs/install_linux.md) for Linux
2. Log in using generated token by using the command `gh auth login`
3. Sync "physicalmapapp" and "pftconfig" using `gh repo sync` ([Tutorial Here](https://cli.github.com/manual/gh_repo_sync))

## Step 4: Run Everything Using PM2
*[PM2 Tutorial Here](https://pm2.keymetrics.io/docs/usage/quick-start/)*
1. Use pip to install required Python packages: Pandas, Fiona, and Shapely
2. Run GeoServer (`startup.sh`) using PM2
3. Run the web app (`app.js`) using PM2
