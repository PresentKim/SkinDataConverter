<template>
	<div id="app">
		<input id="input" type="file" @change="onFileChange" accept=".png,.skindata" class="hidden">

		<label for="input" :class="{hover: dragType === `hover`}" @dragover="onDragEvent($event)" @dragleave="onDragEvent($event)" @drop="onDragEvent($event)">
			<div v-if="!png">
				<span> Select a file or drag here</span> <br/>
				<span class="fake-button">Select a file</span><br/>
			</div>
			<div v-else>
				<img :src="previewSrc" alt="preview"/> <br/>
				<span class="fake-button" @click="download($event, true)">PNG</span>
				<span class="fake-button" @click="download($event, false)">SKINDATA</span>
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
			previewSrc() {
				return this.png ? `data:image/png;base64,${btoa(String.fromCharCode.apply(null, PNG.sync.write(this.png, {filterType: 4})))}` : null;
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
						console.error(`Error : Invalid file format (Required .png or .skindata`);
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
			getSizeByLength(length) {
				const map = {
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
			min-height: 100px;
			margin: 0 auto;
			border-radius: 7px;
			border: 3px solid $nord4;
			transition: all .2s ease;
			user-select: none;

			&:hover, &.hover {
				border-color: $nord8;
			}

			img {
				width: 300px;
				height: 300px;
				margin: 10px;
				border: 3px solid $nord8;
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
