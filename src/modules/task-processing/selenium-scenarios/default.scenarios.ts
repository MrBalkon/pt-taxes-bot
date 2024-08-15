import { WebDriver } from 'selenium-webdriver';
import { Logger } from '@nestjs/common';
import { PageException } from 'src/modules/task-processing-queue/task-processing-queue.error';
import command from 'selenium-webdriver/lib/command';
import * as jszip from 'jszip';

export const goPage =
  (pageName: string, url: string) => async (driver: WebDriver) => {
    try {
      await driver.get(url);
    } catch (error) {
      throw new PageException(`Failed to go to ${pageName} page`);
    }
  };

export const goBack = async (driver: WebDriver) => {
  try {
    await driver.navigate().back();
  } catch (error) {
    throw new PageException('Failed to go back');
  }
};

export interface SeleniumExecuteScenarioArgs {
  driver: WebDriver;
  logger: Logger;
}

export const waitUntilDownloadables = async (driver: WebDriver) => {
  await driver.wait(async () => {
    const files = await driver.getDownloadableFiles();
    return files.length > 0;
  }, 10000);
};

export const getLastDownloadableFileContent = async (driver: WebDriver) => {
  await waitUntilDownloadables(driver);
  const files = await driver.getDownloadableFiles();
  const fileName = files[0];
  const file = (await driver.execute(
    new command.Command(command.Name.DOWNLOAD_FILE).setParameter(
      'name',
      fileName,
    ),
  )) as unknown as { contents: string };

  const loadedContent = await jszip.loadAsync(file.contents, { base64: true });

  await driver.deleteDownloadableFiles();
  return loadedContent.files[fileName].async('text');
};
