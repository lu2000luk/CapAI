<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>
		Cap AI
	</title>
</svelte:head>

{@render children()}
