/*
 * @adonisjs/ally
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Application' {
	import { AllyManagerContract } from '@ioc:Adonis/Addons/Ally'
	export interface ContainerBindings {
		'Adonis/Addons/Ally': AllyManagerContract
	}
}
