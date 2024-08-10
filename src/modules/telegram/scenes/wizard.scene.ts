import { Action, Context, Wizard,  WizardStep } from 'nestjs-telegraf'
import { Scenes } from 'telegraf'

@Wizard('wizardScene')
export class WizardScene {
  @WizardStep(1)
  step1(@Context() ctx: Scenes.WizardContext) {
    const randomData = Math.random()
    ctx.reply('Press the button', {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Press me', callback_data: `action:${randomData}` }],
          ],
        },
        // reply_to_message_id: ctx.message.message_id,
      })
  }

  @Action(/action:.+/)
  button(@Context() ctx: any) {
    const [, data] = ctx.callbackQuery.data.split(':')
    console.log(data)
    ctx.answerCbQuery()
    // save data for next step in ctx.wizard.state
    ctx.wizard.state.data = data
    ctx.wizard.next()
    ctx.wizard.steps[ctx.wizard.cursor](ctx)
  }

  @WizardStep(2)
  async step2(@Context() ctx: Scenes.WizardContext) {
    // ctx.wizard.state contains stored data
    console.log('step2')
    console.log((ctx.wizard.state as any).data)
    ctx.scene.leave()
  }
}