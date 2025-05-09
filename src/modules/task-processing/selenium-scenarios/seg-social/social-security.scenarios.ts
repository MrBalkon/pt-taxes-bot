import { By, Key, WebDriver, until } from 'selenium-webdriver';
import {
  ServiceUnavailableError,
  WrongCredentialsError,
} from 'src/modules/task-processing-queue/task-processing-queue.error';

export const socialSecuriyGoMainPage = async (driver: WebDriver) => {
  try {
    await driver.get('https://app.seg-social.pt/ptss/');
  } catch (error) {
    throw new ServiceUnavailableError('Seg Social');
  }
};

export const socialSecurityLogin = async (
  driver: WebDriver,
  { niss, password },
) => {
  try {
    const nameInput = await driver.findElement(By.name('username'));
    await nameInput.sendKeys(niss);

    const passInput = await driver.findElement(By.name('password'));
    await passInput.sendKeys(password, Key.RETURN);

    // find if there <span>Sair</span> on page
    // if not, it means that login failed
    await driver.findElement(By.xpath("//span[contains(text(), 'Sair')]"));
  } catch (error) {
    throw new WrongCredentialsError('Failed to login to Seg Social');
  }
};
