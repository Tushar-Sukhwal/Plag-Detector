import pandas as pd
import json

# Load the key-value pairs from the JSON file
with open('results.json', 'r') as file:
    key_value_pairs = json.load(file)

# Convert the JSON data into a DataFrame and select only the required fields
new_data = pd.DataFrame(key_value_pairs, columns=['userID', 'noOfNonCheated', 'noOfCheated'])

# Load the existing spreadsheet into a DataFrame
spreadsheet_path = 'existing_spreadsheet.xlsx'
sheet_name = 'Form Responses 1'  # Update this to the correct sheet name
df = pd.read_excel(spreadsheet_path, sheet_name=sheet_name)

# Extract the userID from the CodeForces profile link
df['userID'] = df['CodeForces profile link'].apply(lambda x: x.split('/')[-1])

# Merge the DataFrame with the key-value pairs on 'userID'
updated_df = df.merge(new_data, on='userID', how='left')

# Write the updated DataFrame to a new spreadsheet
new_spreadsheet_path = 'updated_spreadsheet.xlsx'
with pd.ExcelWriter(new_spreadsheet_path, engine='openpyxl') as writer:
    updated_df.to_excel(writer, sheet_name=sheet_name, index=False)

print("New spreadsheet created successfully.")
