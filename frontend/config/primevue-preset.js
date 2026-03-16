import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { palette } from '@primeuix/themes';

const primary = palette('#1B3B6F'); //$color__primary
const secondary = palette('#8DA8D7'); //$color__secondary
const success = palette('#5DAF1C'); //$color__accent-green
const warning = palette('#DB9C35'); //$color__accent-orange
const danger = palette('#C40000'); //$color__accent-red
const white = palette('#FFFFFF'); //$color__white
const lightGrey = palette('#D9D9D9'); //$color__light-grey
const midGrey = palette('#AFAFAF'); //$color__mid-grey
const black = palette('#1E1E1E'); //$color__black


export const CustomPreset = definePreset(Aura, {
	common: {
		fontFamily: 'Roboto, sans-serif',
	},
	semantic: {
		colorScheme: {
			light: {
				primary,
				secondary,
				success,
				warning,
				danger,
			},
		},
	},
	components: {
		menubar: {
			root: {
				background: '{primary.color}',
			},
			item: {
				root: {
					background: '{secondary.color}',
					color: '{primary.contrast.color}',
					active: {
						background: '#8DA8D7',
						color: '{primary.contrast.color}',
					},
					focus: {
						background: '#8DA8D7',
						color: '{primary.contrast.color}',
					},
					hover: {
						background: '#8DA8D7',
						color: '{primary.contrast.color}',
					},
				},
			},
		},
		datatable: {
			header: {
				cell: {
					color: '{primary.contrast.color}',
					background: '#8DA8D7',
				},
			},
			bodyCell: {
				style: {
					border: '1px solid #D9D9D9'
				  }
			},
		}
	},
});
