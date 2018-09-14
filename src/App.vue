<template>
	<div id="app">
		<input id="input" type="file" @change="onFileChange" accept=".png,.skindata" class="hidden">

		<label for="input" :class="{hover: dragType === `hover`}" @dragover="onDragEvent" @dragleave="onDragEvent" @drop="onDragEvent">
			<div v-if="png">
				<div id="preview" :class="{small: this.png.height === 32}" v-html="previewSVG"></div>
				<span id="filename"> {{ filename }} </span>
				<span id="skin-size"> ({{ this.png.height }}x{{ this.png.width }}) </span> <br/>
				<span class="fake-button" @click="download($event, true)">PNG</span>
				<span class="fake-button" @click="download($event, false)">SKINDATA</span>
				<span v-if="png.data.length === 1024" class="fake-button" @click="toOreMonster">toOreMonster</span>
			</div>
			<div v-else>
				<font-awesome-icon id="icon" icon="download"/>
				<br/>
				<span> Select a file or drag here</span> <br/>
				<span class="fake-button">Select a file</span> <br/>
			</div>
		</label>
	</div>
</template>

<script>
	import {PNG} from 'pngjs';

	export default {
		name: 'app',
		data() {
			return {
				filename: null,
				png: null,
				dragType: null
			}
		},
		computed: {
			previewSVG() {
				let xmlns = `http://www.w3.org/2000/svg`;
				let svg = document.createElementNS(xmlns, `svg`);
				svg.setAttribute(`width`, `300`);
				svg.setAttribute(`height`, this.png.height === 32 ? `150` : `300`);
				svg.setAttribute(`viewBox`, `0 0 ${this.png.width} ${this.png.height}`);

				let baseRect = document.createElementNS(xmlns, `rect`);
				baseRect.setAttribute(`width`, `1`);
				baseRect.setAttribute(`height`, `1`);
				for (let x = 0; x < this.png.width; x++) {
					for (let y = 0; y < this.png.height; y++) {
						let index = (this.png.width * y + x) << 2;

						let r = this.png.data[index++];
						let g = this.png.data[index++];
						let b = this.png.data[index++];
						if (this.png.data[index] !== 0) {
							let rect = baseRect.cloneNode();
							rect.setAttribute(`fill`, `#${(`0${r.toString(16)}`).slice(-2)}${(`0${g.toString(16)}`).slice(-2)}${(`0${b.toString(16)}`).slice(-2)}`);
							rect.setAttribute(`x`, `${x}`);
							rect.setAttribute(`y`, `${y}`);
							svg.appendChild(rect);
						}
					}
				}
				return svg.outerHTML;
			}
		},
		methods: {
			onFileChange(event) {
				let files = event.target.files || event.dataTransfer.files;
				if (files.length) {
					this.png = null;
					let file = files[0];
					let reader = new FileReader();
					if (/\.png$/i.test(file.name)) { //Convert .png to .skindata
						reader.onload = () => {
							new PNG({filterType: 4}).parse(reader.result, (err, png) => {
								if (err) {
									console.error(err);
									return;
								} else if (this.getSizeByLength(png.width * png.height * 4) === undefined) {
									console.error(`Error : Invalid skin png format (${png.height}x${png.width} is invalid size)`);
									return;
								}
								this.png = png;
								this.filename = file.name;
							});
						};
					} else if (/\.skindata/i.test(file.name)) { //Convert .skindata to .png
						reader.onload = () => {
							let skindata = new Uint8Array(reader.result);
							let size = this.getSizeByLength(skindata.length);
							if (size === undefined) {
								console.error(`Error : Invalid skin data format (${skindata.length} is invalid size)`);
								return;
							}
							let png = new PNG({...size, filterType: 4});
							png.data = skindata;
							this.png = png;
							this.filename = file.name;
						};
					} else {
						console.error(`Error : Invalid file format (Required .png or .skindata)`);
						return;
					}
					reader.readAsArrayBuffer(file);
				}
			},
			onDragEvent(event) {
				event.preventDefault();
				this.dragType = event.type;
				if (event.type === `drop`) {
					this.onFileChange(event);
				}
			},
			download(event, isPNG) {
				event.preventDefault();
				let buffer, type, filename;
				if (isPNG) {
					buffer = PNG.sync.write(this.png, {filterType: 4});
					type = `image/png`;
					filename = this.filename.replace(/\.skindata$/i, `.png`);
				} else {
					buffer = this.png.data;
					type = `application/octet-stream`;
					filename = this.filename.replace(/\.png$/i, `.skindata`);
				}
				let blob = new Blob([buffer], {type});
				let url = window.URL.createObjectURL(blob);
				let anchor = document.createElement('a');
				anchor.href = url;
				anchor.download = filename;
				document.body.appendChild(anchor);
				anchor.click();
				anchor.remove();
				window.URL.revokeObjectURL(url);
			},
			toOreMonster(event) {
				event.preventDefault();
				let newData = new Uint8Array(16384); //64 * 64 * 4
				[{x: 16, y: 0},{x: 32, y: 0}, {x: 0, y: 16}, {x: 16, y: 16}, {x: 32, y: 16}, {x: 48, y: 16}].forEach(point => {
					for (let x = 0; x < this.png.width; ++x) {
						for (let y = 0; y < this.png.height; ++y) {
							let index = (this.png.width * y + x) << 2;
							let newIndex = ((this.png.width * 4) * (point.y + y) + (point.x + x)) << 2;

							let r = this.png.data[index++];
							let g = this.png.data[index++];
							let b = this.png.data[index++];
							let a = this.png.data[index];
							newData[newIndex++] = r;
							newData[newIndex++] = g;
							newData[newIndex++] = b;
							newData[newIndex] = a;
						}
					}
				});
				this.png.width = this.png.height = 64;
				this.png.data = newData;
			},
			getSizeByLength(length) {
				const map = {
					1024: {width: 16, height: 16}, //16 * 16 * 4
					8192: {width: 64, height: 32}, //64 * 32 * 4
					16384: {width: 64, height: 64}, //64 * 64 * 4
					65536: {width: 128, height: 128}, //128 * 128 * 4
				};
				return map[length];
			}
		}
	}
</script>

<style lang="scss">
	@import "nord.scss";

	body {
		background-color: $nord0;
		color: $nord8;
		font-size: 20pt;

		#input {
			display: none;
		}

		label {
			display: block;
			text-align: center;
			width: 100%;
			max-width: 600px;
			margin: 0 auto;
			padding: 100px 0;
			border-radius: 7px;
			border: 3px solid $nord4;
			transition: all .2s ease;
			user-select: none;

			&:hover, &.hover {
				border-color: $nord8;
			}

			#preview {
				width: 300px;
				height: 300px;
				border: 3px solid $nord8;
				margin: 0 auto;

				&.small {
					height: 150px;
				}
			}

			#skin-size {
				font-size: 16pt;
				color: $nord3;
			}

			#icon {
				display: inline-block;
				font-size: 100pt;
			}

			.fake-button {
				display: inline-block;
				background: $nord8;
				margin: 10px;
				padding: 0 20px;
				height: 36px;
				line-height: 36px;
				color: $nord6;
				font-weight: bold;
				font-size: 16px;
				border-radius: 5px;
				cursor: pointer;
				transition: all .2s ease;

				&:hover {
					background: $nord10;
				}
			}
		}
	}
</style>
