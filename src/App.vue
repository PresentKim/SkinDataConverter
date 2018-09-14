<template>
	<div id="app">
		<input type="file" @change="onFileChange">
		<img v-if="previewSrc" :src="previewSrc" alt="preview"/>
	</div>
</template>

<script>
	import {PNG} from 'pngjs';

	export default {
		name: 'app',
		data() {
			return {
				png: null
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
								for (let x = 0; x < png.width; x++) {
									for (let y = 0; y < png.height; y++) {
										let index = (png.width * y + x) << 2;

										// store r,g,b
										png.data[index] = png.data[index++];
										png.data[index] = png.data[index++];
										png.data[index] = png.data[index++];
										// store a with simplify
										png.data[index] = png.data[index] ? 255 : 0;
									}
								}
								this.png = png;
								this.downloadBuffer(png.data, file.name.replace(/\.png$/i, `.skindata`), `application/octet-stream`);
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
							this.downloadBuffer(PNG.sync.write(png, {filterType: 4}), file.name.replace(/\.skindata/i, `.png`), `image/png`);
						};
					} else {
						console.error(`Error : Invalid file format (Required .png or .skindata`);
						return;
					}
					reader.readAsArrayBuffer(file);
				}
			},
			downloadBuffer(buffer, filename, type) {
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
	}
</style>
