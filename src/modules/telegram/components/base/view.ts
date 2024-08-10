import Handlebars from "handlebars"
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { SceneContext } from 'telegraf/typings/scenes'
import { Telegram } from 'telegraf'

Handlebars.registerHelper(
	'singleLineOnly',
	function (options) { // "this" cannot be provided to inline function!
	  return options.fn(this).replace(/[\r\n]+/gm, '')
	}
  )
Handlebars.registerHelper(
'singleSpaceOnly',
function (options) { // "this" cannot be provided to inline function!
	return options.fn(this).replace(/\s\s+/g, ' ')
}
)

// register helper that gonna replace all left spaces
Handlebars.registerHelper(
	'leftTrim',
	function (options) { // "this" cannot be provided to inline function!
		return options.fn(this).replace(/^\s+/, '')
	}
)

// register helper that remove all tabs
Handlebars.registerHelper(
	'removeTabs',
	function (options) { // "this" cannot be provided to inline function!
		return options.fn(this).replace(/\t/g, '')
	}
)

export interface CreateViewProps<T> {
	text: string
	extraGetter?: (context: T) => ExtraReplyMessage
}

export interface ViewProps<T> {
	context: T
}

export const TelegramView = <T>(globalProps: CreateViewProps<T>) => {
	const defaultText = `{{#removeTabs}}${globalProps.text}{{/removeTabs}}`
	const template = Handlebars.compile<T>(defaultText, { compat: true })
	return {
		renderReply: async (ctx: SceneContext, props: T) => {
			const text = template(props)

			const extra = globalProps.extraGetter ? globalProps.extraGetter(props) : {}

			await ctx.reply(text, extra)
		},
		renderSendMessage: async (telegram: Telegram, chatId: string, props: T) => {
			const text = template(props)

			const extra = globalProps.extraGetter ? globalProps.extraGetter(props) : {}

			await telegram.sendMessage(chatId, text, extra)
		}
	}
}