<template>
	<div id="app">
		<input type="file" @change="onFileChange">
	</div>
</template>

<script>
	import {PNG} from 'pngjs';

	export default {
		name: 'app',
		data() {
			return {}
		},
		methods: {
			onFileChange(event) {
				let files = event.target.files || event.dataTransfer.files;
				if (files.length) {
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
								let buffer = new Uint8Array(png.width * png.height * 4);
								for (let x = 0; x < png.width; x++) {
									for (let y = 0; y < png.height; y++) {
										let index = (png.width * y + x) << 2;

										// store r,g,b
										buffer[index] = png.data[index++];
										buffer[index] = png.data[index++];
										buffer[index] = png.data[index++];
										// store a with simplify
										buffer[index] = png.data[index] ? 255 : 0;
									}
								}
								this.downloadBuffer(buffer, file.name.replace(/\.png$/i, `.skindata`), `application/octet-stream`);
							});
						};
					} else if (/\.skindata/i.test(file.name)) { //TODO: Convert .skindata to .png
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
