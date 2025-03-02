const inquirer = require('@inquirer/prompts'); // Handles user input via terminal
const fs = require('fs'); // File system module to read/write files
const path = require('path'); // Path module to handle file paths
const xlsx = require('xlsx'); // Library to handle Excel file operations
const { NFC } = require('nfc-pcsc'); // NFC module to interact with NFC card readers

/**
 * Reads an XLSX file and extracts data into JSON format.
 * @param {string} filePath - The full path of the XLSX file to read.
 * @returns {Promise<Object>} - Resolves with workbook and data extracted from the Excel file.
 */
const readXLSX = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error('XLSX file does not exist.'));
      return;
    }

    const workbook = xlsx.readFile(filePath); // Read the XLSX file
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet data to JSON

    console.table(data); // Display the data in table format for verification
    resolve({ workbook, data });
  });
};

/**
 * Asks the user to input the name of an XLSX file and validates its existence.
 * @returns {Promise<string>} - Resolves with the full file path of the XLSX file.
 */
const askForXLSXFile = async () => {
  const fileName = await inquirer.input({
    message: 'What is the XLSX File Name? (including .xlsx)',
    validate: (input) => {
      const filePath = path.join(process.cwd(), input);
      if (fs.existsSync(filePath) && path.extname(filePath) === '.xlsx') {
        return true;
      } else {
        return 'File does not exist or is not an XLSX file. Please enter a valid file name.';
      }
    },
  });

  return path.join(process.cwd(), fileName);
};

/**
 * Asks the user for confirmation before proceeding with scanning.
 * @returns {Promise<string>} - Resolves with user choice ('yes' or 'no').
 */
const askForConfirmation = async () => {
  const confirmation = await inquirer.select({
    message: 'Press Y to Continue or X to Exit',
    choices: [
      { name: 'Y', value: 'yes' },
      { name: 'X', value: 'no' },
    ],
  });

  return confirmation;
};

/**
 * Saves updated data back to the Excel file.
 * @param {Object} workbook - The XLSX workbook object.
 * @param {Array} data - The updated data array.
 * @param {string} fileName - The file name of the XLSX file.
 */
const saveToExcel = (workbook, data, fileName) => {
  const newWorksheet = xlsx.utils.json_to_sheet(data); // Convert JSON to Excel sheet
  workbook.Sheets[workbook.SheetNames[0]] = newWorksheet; // Replace old sheet with new data
  xlsx.writeFile(workbook, fileName); // Save the updated workbook
  console.log('Excel file updated after each scan.');
};

/**
 * Main function to execute the NFC scanning and update the Excel file.
 */
const main = async () => {
  try {
    const fileName = await askForXLSXFile(); // Prompt user for XLSX file name
    console.log('File Path:', fileName);

    const { workbook, data } = await readXLSX(fileName); // Read the XLSX file
    const nfc = new NFC(); // Initialize NFC reader

    nfc.on('reader', (reader) => {
      console.log(`${reader.reader.name} device attached`);

      (async () => {
        while (true) {
          const confirmation = await askForConfirmation(); // Ask user if they want to proceed

          if (confirmation === 'yes') {
            for (const row of data) {
              const { firstname: firstName, lastname: lastName } = row;
              console.log(`Please Scan ${firstName} ${lastName}`);

              // Wait for the card scan
              await new Promise((resolve) => {
                reader.once('card', (card) => {
                  console.log(`Scanned UID: ${card.uid}`);
                  row.SecuredLRN = card.uid; // Store scanned card UID into the row
                  saveToExcel(workbook, data, fileName); // Save changes to Excel
                  resolve(); // Continue to the next row
                });
              });
            }

            console.log('All scans completed.');
            break; // Exit loop after scanning all rows
          } else {
            console.log('Operation cancelled.');
            break; // Exit if user does not want to continue
          }
        }

        reader.close();
      })();

      reader.on('error', (err) => {
        console.log(`${reader.reader.name} an error occurred`, err);
      });

      reader.on('end', () => {
        console.log(`${reader.reader.name} device removed`);
      });
    });

    nfc.on('error', (err) => {
      console.log('An error occurred', err);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
};

main(); // Run the main function
