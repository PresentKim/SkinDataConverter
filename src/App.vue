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
								let buffer = new Uint8Array(png.width * png.height * 4);
								for (let x = 0; x < png.width; x++) {
									for (let y = 0; y < png.height; y++) {
										let index = (png.width * y + x) << 2;

										// store r,g,b
										buffer[index] = png.data[index++];
										buffer[index] = png.data[index++];
										buffer[index] = png.data[index++];
										// store a with simplify
										png.data[index] = png.data[index] ? 255 : 0;
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
