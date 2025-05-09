import * as webdriver from 'selenium-webdriver';

declare module 'selenium-webdriver' {
  export interface WebDriver {
    getDownloadableFiles(): Promise<string[]>;
    downloadFile(fileName: string, targetDirectory: string): Promise<void>;
    deleteDownloadableFiles(): Promise<void>;
  }
}

declare module 'selenium-webdriver/lib/command' {
  export interface ICommandName {
    GET_DOWNLOADABLE_FILES: 'getDownloadableFiles';
    DOWNLOAD_FILE: 'downloadFile';
    DELETE_DOWNLOADABLE_FILES: 'deleteDownloadableFiles';
  }

  export const Name: ICommandName;
}
// async getDownloadableFiles() {
//     const caps = await this.getCapabilities()
//     if (!caps['map_'].get('se:downloadsEnabled')) {
//       throw new error.WebDriverError('Downloads must be enabled in options')
//     }

//     return (await this.execute(new command.Command(command.Name.GET_DOWNLOADABLE_FILES))).names
//   }

//   async downloadFile(fileName, targetDirectory) {
//     const caps = await this.getCapabilities()
//     if (!caps['map_'].get('se:downloadsEnabled')) {
//       throw new Error('Downloads must be enabled in options')
//     }

//     const response = await this.execute(new command.Command(command.Name.DOWNLOAD_FILE).setParameter('name', fileName))

//     const base64Content = response.contents

//     if (!targetDirectory.endsWith('/')) {
//       targetDirectory += '/'
//     }

//     fs.mkdirSync(targetDirectory, { recursive: true })
//     const zipFilePath = path.join(targetDirectory, `${fileName}.zip`)
//     fs.writeFileSync(zipFilePath, Buffer.from(base64Content, 'base64'))

//     const zipData = fs.readFileSync(zipFilePath)
//     await JSZip.loadAsync(zipData)
//       .then((zip) => {
//         // Iterate through each file in the zip archive
//         Object.keys(zip.files).forEach(async (fileName) => {
//           const fileData = await zip.files[fileName].async('nodebuffer')
//           fs.writeFileSync(`${targetDirectory}/${fileName}`, fileData)
//           console.log(`File extracted: ${fileName}`)
//         })
//       })
//       .catch((error) => {
//         console.error('Error unzipping file:', error)
//       })
//   }

//   async deleteDownloadableFiles() {
//     const caps = await this.getCapabilities()
//     if (!caps['map_'].get('se:downloadsEnabled')) {
//       throw new error.WebDriverError('Downloads must be enabled in options')
//     }

//     return await this.execute(new command.Command(command.Name.DELETE_DOWNLOADABLE_FILES))
//   }
