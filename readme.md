### *All configuration files listed below should be in [pftconfig](https://github.com/kaiyuanh2/pftappconfig) repository.*

# How to run the app locally

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
1. Open the terminal, navigate to the directory of the web app
2. Run `nodemon app.js` (use nodemon instead of node to make app restart automatically when files change)
3. The link should be `localhost:3000` to access from web browsers (if the port 3000 is not occupied), the terminal will display debug output

# How to run the app on AWS instance (available later)
