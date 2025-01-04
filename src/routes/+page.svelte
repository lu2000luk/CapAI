<script lang="ts">
  import Cap from "$lib/cap.png";
  import User from "$lib/user.png";
  import { fade, blur } from "svelte/transition";
  import { DotLottieSvelte } from "@lottiefiles/dotlottie-svelte";

  type Message = {
    message: string;
    user: boolean;
  };

  let question = $state("");
  let content = $state("");
  let AIResponseTime = $state(0);
  let AIResponseTimer: any;
  let error: string | boolean = $state(false);
  let response: string = $state("");
  let final_response = "";

  let conversation: Message[] = $state([]);
  let conv_loading = $state(false);
  let conv_error: string | boolean = $state(false);
  let conv_input = $state("");
  let conv_input_focus = $state(false);

  let ratelimit_loading = $state(false);

  async function runAI(question: string, retry = false) {
    error = "";
    if (retry) ratelimit_loading = false;

    if (question.length < 1) return;
    if (question.length > 800) {
      error = "Question is too long.";
      return;
    }

    AIResponseTime = 0;
    content = "loading";
    AIResponseTimer = setInterval(() => {
      AIResponseTime++;
    }, 10);

    const fresponse = await fetch(`/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question, debug: false }),
    });

    const data = await fresponse.json();
    clearInterval(AIResponseTimer);

    if (data.ratelimited && !data.success) {
      if (!retry) {
        ratelimit_loading = true;
        setTimeout(() => runAI(question, true), 8000);
        return;
      }
    }

    if (data.error) {
      content = "";
      error = data.error;
      console.error(data.error);

      return;
    }

    final_response = data.result;
    response = "";

    add_user_message(question);
    add_ai_message(final_response);

    content = "response";
  }

  function add_user_message(message: string) {
    conversation.push({ message, user: true });
  }

  function add_ai_message(message: string) {
    conversation.push({ message, user: false });
  }

  async function advance(message: string, conversation: Message[]) {
    if (message.length < 1) return;

    if (conversation.length > 10) {
      conversation.shift();
    };

    if (message.length > 800) {
      conv_error = "Message is too long.";
      return;
    }

    conv_loading = true;
    conv_error = false;

    const fresponse = await fetch(`/ai`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: message, debug: false, conversation }),
    });

    const data = await fresponse.json();

    if (data.error) {
      conv_error = data.error;
      console.error(data.error);
      return;
    }

    add_user_message(message);
    add_ai_message(data.result);

    conv_loading = false;
    conv_input = "";
  }
</script>

<div class="app w-full h-full flex items-center justify-center">
  <div
    class="app-content py-5 px-8 rounded-xl border-2 transition-all duration-200 bg-opacity-15 bg-black"
  >
    <div
      class="app-title flex items-center gap-5 scale-75 select-none mx-24 cursor-pointer"
    >
      <img src={Cap} alt="Cap" class="cap_icon" />
      <h1 class="text-8xl source">AI</h1>
    </div>

    {#if content === "what"}
      <div class="flex flex-col items-center">
        <p class="source">
          CapAI is an AI that answers any question in a funny and mostly wrong
          way.
        </p>

        <button
          class="py-1 rounded px-4 bg-white text-black mt-4"
          transition:fade
          onclick={() => (content = "")}
        >
          Back
        </button>
      </div>
    {:else if content === "disclamer"}
      <div class="flex flex-col items-center">
        <p class="source w-96">
          The app creator is not responsible for anything said by the AI /
          derived from the AI output. The application is made as a fun project
          and should not be taken seriously. <br /> We store your IP address to prevent
          abuse of the service.
        </p>

        <button
          class="py-1 rounded px-4 bg-white text-black my-4"
          transition:fade
          onclick={() => (content = "")}
        >
          Back
        </button>
      </div>
    {:else if content === "loading"}
      <div class="flex flex-col items-center" transition:blur>
        {#if ratelimit_loading}
          <p class="source text-sm p-1 rounded bg-red-700">
            ❕ Your request has been slowed down to prevent abuse.
          </p>
        {/if}
        <p class="source">{Math.round(AIResponseTime / 100)}s</p>
        <DotLottieSvelte
          src="../CapAILoading.json"
          speed={0.5}
          mode="reverse-bounce"
          useFrameInterpolation
          loop
          autoplay
        />
        <br />
        <p class="source text-sm">Loading animation made by lu2000luk</p>
      </div>
    {:else if content === "response"}
      <div class="w-full">
        <div class="flex flex-col w-full gap-1 mb-2">
          {#each conversation as message}
            {#if message.user}
              <div class="flex gap-2 items-center justify-end">
                <p class="text-xl p-2 rounded bg-green-600">{message.message}</p>
                <span class="source">
                  <img src={User} alt="USER" class="w-8 h-8" />
                </span>
              </div>
            {:else}
              <div class="flex gap-2 items-center justify-start">
                <span class="source">
                  <img src={Cap} alt="AI" class="w-8 h-8" />
                </span>
                <p class="text-xl p-2 rounded bg-blue-600">{message.message}</p>
              </div>
            {/if}
          {/each}
        </div>
        <i class="text-sm source scale-50">
          ⚠️ Do not act upon the AI's response
        </i>
      </div>

      <div class="flex justify-between gap-0 mt-4 items-center">
        {#if conv_loading}
          <DotLottieSvelte
            src="../CapAIConversationLoading.json"
            speed={0.5}
            mode="reverse-bounce"
            useFrameInterpolation
            loop
            autoplay
          />
        {:else}
          {#if conv_input.length < 1 && !conv_input_focus}
            <button
              class="py-2 rounded-full pr-8 pl-4 mr-2 bg-white text-black flex gap-2 items-center transition-all duration-200 hover:bg-opacity-75"
              transition:blur
              onclick={() => {
                content = "";
                question = "";
                conversation = [];
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                class="scale-75"
                ><g
                  fill="none"
                  stroke="currentColor"
                  stroke-dasharray="12"
                  stroke-dashoffset="12"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  ><path d="M5 12l7 -7M5 12l7 7"
                    ><animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="0.3s"
                      values="12;0"
                    /></path
                  ><path d="M11 12l7 -7M11 12l7 7"
                    ><animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      begin="0.3s"
                      dur="0.3s"
                      values="12;0"
                    /></path
                  ></g
                ></svg
              >
              Back
            </button>
          {/if}
          <input
            type="text"
            bind:value={conv_input}
            class="continueConversation focus:outline-none ring-0 outline-none w-full py-3 px-4 border-none bg-[#27272a] rounded-full caret-slate-300 text-white focus:ring-0 source"
            style={conv_input.length > 0 || conv_input_focus
              ? "border-radius: 999px 0 0 999px"
              : ""}
            placeholder="Continue conversation..."
            onkeydown={(event) => {
              if (event.key === "Enter") {
                advance(conv_input, conversation);
              }
            }}
            onfocus={() => (conv_input_focus = true)}
            onblur={() => (conv_input_focus = false)}
          />

          {#if conv_input.length > 0 || conv_input_focus}
            <button
              class="py-2 px-5 rounded-full bg-white text-black flex gap-2 items-center rounded-l-none transition-all duration-200 hover:bg-opacity-75"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                ><g
                  fill="none"
                  stroke="currentColor"
                  stroke-dasharray="12"
                  stroke-dashoffset="12"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  ><path d="M19 12l-7 -7M19 12l-7 7"
                    ><animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="0.3s"
                      values="12;0"
                    /></path
                  ><path d="M13 12l-7 -7M13 12l-7 7"
                    ><animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      begin="0.3s"
                      dur="0.3s"
                      values="12;0"
                    /></path
                  ></g
                ></svg
              >
            </button>
          {/if}
        {/if}
      </div>
    {:else}
      {#if error}
        <div class="p-5 flex flex-col bg-red-800 mb-5 rounded" transition:fade>
          <p class="flex gap-2 items-end source">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              ><g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                ><path
                  stroke-dasharray="64"
                  stroke-dashoffset="64"
                  d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                  ><animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.6s"
                    values="64;0"
                  /></path
                ><path stroke-dasharray="8" stroke-dashoffset="8" d="M12 7v6"
                  ><animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.6s"
                    dur="0.2s"
                    values="8;0"
                  /></path
                ><path
                  stroke-dasharray="2"
                  stroke-dashoffset="2"
                  d="M12 17v0.01"
                  ><animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.8s"
                    dur="0.2s"
                    values="2;0"
                  /></path
                ></g
              ></svg
            >
            <span class="text-2xl">Error</span>
          </p>
          <p class="mt-2">
            {error}
          </p>
        </div>
      {/if}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="app-ai-bar flex items-center justify-between rounded-full w-full bg-[#27272a] mb-6 transition-all duration-200 shadow-blue-600 {question.length >
        1
          ? 'shadow-sm'
          : 'shadow-none'}"
        transition:blur
        onkeydown={(event) => {
          if (event.key === "Enter") {
            runAI(question);
          }

          if (event.key === "Escape") {
            question = "";
          }
        }}
      >
        <!-- svelte-ignore a11y_autofocus -->
        <input
          bind:value={question}
          type="text"
          id="app-ai-input"
          autocomplete="off"
          autocorrect="off"
          autofocus
          class="ml-1 caret-slate-300 bg-transparent source border-none outline-none focus:ring-0 w-full my-1.5"
          placeholder="Ask me anything..."
        />
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        {#if question.length > 1}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            transition:blur
            class="go-arrow p-2 rounded-full hover:bg-[#18181bab] cursor-pointer transition-all duration-200 mr-0.5"
            onclick={() => runAI(question)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              ><g
                fill="none"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                ><path
                  stroke-dasharray="20"
                  stroke-dashoffset="20"
                  d="M3 12h17.5"
                  ><animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.2s"
                    values="20;0"
                  /></path
                ><path
                  stroke-dasharray="12"
                  stroke-dashoffset="12"
                  d="M21 12l-7 7M21 12l-7 -7"
                  ><animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    begin="0.2s"
                    dur="0.2s"
                    values="12;0"
                  /></path
                ></g
              ></svg
            >
          </div>
        {/if}
      </div>

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="legal flex justify-center items-center gap-4 cursor-pointer mb-5 shadow-sm"
        transition:fade
      >
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <p
          class="hover:underline"
          onclick={() => {
            content = "what";
          }}
        >
          What?
        </p>
        <div class="dot p-1 rounded-full bg-gray-100 scale-50"></div>
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <p
          class="hover:underline"
          onclick={() => {
            content = "disclamer";
          }}
        >
          Disclamer
        </p>
        <div class="dot p-1 rounded-full bg-gray-100 scale-50"></div>
        <a class="hover:underline" href="https://lu2000luk.com" target="_blank">
          Made by lu2000luk
        </a>
      </div>
    {/if}
  </div>
</div>
