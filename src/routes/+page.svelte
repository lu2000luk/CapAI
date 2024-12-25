<script>
    import Cap from '$lib/Cap.png';
    import { fade, blur } from 'svelte/transition';

    let question = $state("");
    let content = $state("");
</script>

<div class="app w-full h-full flex items-center justify-center">
    <div class="app-content py-5 px-8 rounded-xl border-2 transition-all duration-200 bg-opacity-15 bg-black">
        <div class="app-title flex items-center gap-5 scale-75 select-none cursor-pointer mx-24">
            <img src={Cap} alt="Cap">
            <h1 class="text-8xl source">AI</h1>
        </div>

        {#if content === "what"}
            <div class="flex flex-col items-center">
                <p class="source">
                    CapAI is an AI that answers any question <b>wrong</b>.
                </p>

                <button class="py-1 rounded px-4 bg-white text-black mt-4" transition:fade onclick={() => content = ""}>
                    Back
                </button>
            </div>
        {:else if content === "disclamer"}
            <div class="flex flex-col items-center">
                <p class="source w-96">
                    The app creator is not responsible for anything said by the AI / derived from the AI output. The application is made as a fun project and should not be taken seriously. <br> We store your IP address to prevent abuse of the service.
                </p>

                <button class="py-1 rounded px-4 bg-white text-black my-4" transition:fade onclick={() => content = ""}>
                    Back
                </button>
            </div>
        {:else}                
            <div class="app-ai-bar flex items-center justify-between rounded-full w-full bg-[#27272a] mb-6 transition-all duration-200 shadow-blue-600 {question.length > 1 ? "shadow-sm" : "shadow-none"}" transition:fade>
                <input bind:value={question} type="text" id="app-ai-input" class="ml-1 bg-transparent source border-none outline-none focus:ring-0 w-full my-1.5" placeholder="Ask me anything...">
                {#if question.length > 1} 
                    <div transition:blur class="go-arrow p-2 rounded-full hover:bg-[#18181bab] cursor-pointer transition-all duration-200 mr-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="20" stroke-dashoffset="20" d="M3 12h17.5"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="20;0"/></path><path stroke-dasharray="12" stroke-dashoffset="12" d="M21 12l-7 7M21 12l-7 -7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.2s" values="12;0"/></path></g></svg>
                    </div>
                {/if}
            </div>

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="legal flex justify-center items-center gap-4 cursor-pointer mb-5 shadow-sm" transition:fade>
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <p class="hover:underline" onclick={() => {
                    content = "what";
                }}>What?</p>
                <div class="dot p-1 rounded-full bg-gray-100 scale-50"></div>
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <p class="hover:underline"onclick={() => {
                    content = "disclamer";
                }}>Disclamer</p>
            </div>
        {/if}
    </div>
</div>