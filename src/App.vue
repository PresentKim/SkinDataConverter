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
