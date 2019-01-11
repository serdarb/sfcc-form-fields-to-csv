# sfcc-form-fields-to-csv
A tool to collect sites form field info from XML files and export them in one CSV file. While gathering info considers cartridge path and site locales.

*Please set the settings in the settings in .env file before running the tool.*

### OCAPI Roles & Permissions

*Administration >  Site Development >  Open Commerce API Settings*

<pre><code>
{
    "client_id": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "resources": [{
                    "resource_id": "/code_versions",
                    "methods": ["get"],
                    "read_attributes": "(**)",
                    "write_attributes": "(**)"
                },
                {
                    "resource_id": "/sites/**",
                    "methods": ["get"],
                    "read_attributes": "(**)",
                    "write_attributes": "(**)"
                }]
}
</code></pre>

 ### How to run this tool?
 
 you should have git, node and npm installed so that you can run the tool with these commands.
 
 <pre><code>
 git clone https://github.com/serdarb/sfcc-form-fields-to-csv.git
 cd  .\sfcc-field-info-export\
 npm install
 node .\index.js
 </code></pre>
 
