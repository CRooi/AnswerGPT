<template>
  <main>
    <Logo style="display: block;" />
    <div class="flex items-center mt-2">
      <span class="text-2xl text-slate font-extrabold mr-1">Answer</span>
      <span class="text-2xl text-transparent font-extrabold bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-600">GPT</span>
    </div>
    <p class="text-slate mt-1 op-60">Question answer tool based on OpenAI ChatGPT API (gpt-3.5-turbo-0301).</p>
    <section class="grid grid-cols-1 md:grid-cols-3 gap-2 my-6 op-60 text-slate text-sm" v-show="guideShow">
      <div class="bg-slate bg-opacity-15 p-6 rounded-md flex gap-3 md:flex-col items-center md:justify-center">
        <div class="px-4 py-2 text-xl font-extrabold bg-light-50 bg-op-10 rounded-lg">1</div>
        <div class="text-center">Enter your question</div>
      </div>
      <div class="bg-slate bg-opacity-15 p-6 rounded-md flex gap-3 md:flex-col items-center md:justify-center">
      <div class="px-4 py-2 text-xl font-extrabold bg-light-50 bg-op-10 rounded-lg">2</div>
        <div class="text-center">AI answer your question</div>
      </div>
      <div class="bg-slate bg-opacity-15 p-6 rounded-md flex gap-3 md:flex-col items-center md:justify-center">
      <div class="px-4 py-2 text-xl font-extrabold bg-light-50 bg-op-10 rounded-lg">3</div>
        <div class="text-center">Continue to enter your question</div>
      </div>
    </section>

    <p class="py-3 text-slate leading-relaxed break-words" v-html="msg" v-if="done"></p>
    <p class="py-3 text-slate leading-relaxed break-words" v-html="msg+'▋'" v-if="!done"></p>

    <div class="my-4 flex items-center gap-2">
      <div
        class="w-full px-4 h-12 text-slate rounded-sm bg-slate bg-op-15 flex"
        style="align-items: center; justify-content: center;"
        v-show="!done"
      >
        AI is thinking...
      </div>
      <input
        v-model="input"
        type="text"
        id="input"
        placeholder="Enter your question..."
        style="border: none;"
        v-on:keyup.enter="onEnterKey($event)"
        v-show="done"
        class="w-full px-4 h-12 text-slate rounded-sm bg-slate bg-op-15 focus:bg-op-20 focus:ring-0 focus:outline-none placeholder:text-slate-400 placeholder:op-30"
      />
      <button
        class="h-12 px-4 py-2
        bg-slate bg-op-15 hover:bg-op-20
        text-slate rounded-sm"
        style="border: none;"
        @click="gpt()"
        v-show="done"
      >
        Submit
      </button>
      <button
        class="h-12 px-4 py-2
        bg-slate bg-op-15 hover:bg-op-20
        text-slate rounded-sm"
        style="border: none;"
        v-show="done"
        @click="clear()"
      >
        <svg data-hk="s00-4-1-0" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M8 20v-5h2v5h9v-7H5v7h3zm-4-9h16V8h-6V4h-4v4H4v3zM3 21v-8H2V7a1 1 0 0 1 1-1h5V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3h5a1 1 0 0 1 1 1v6h-1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"></path></svg>
      </button>
    </div>
    <div class="op-60 text-slate">
      <p class="mt-6 text-sm text-slate">
        <span class="pr-1">Made by</span>
        <a href="https://crooi.io" target="_blank">CRooi</a>
        <span class="pr-1">&nbsp;|</span>
        <a href="https://github.com/CRooi/AnswerGPT" target="_blank">Source Code</a>
      </p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Logo from './Logo.vue'
let input = ref('')
let msg = ref('')
let done = ref(true as boolean)
let guideShow = ref(true as boolean)
let users: any = []
let assistants: any = []

let gpt = async () => {
  done.value = false
  guideShow.value = false
  msg.value += '❓ ' + input.value + '<br>🤖️&nbsp;'
  let prompt = input.value
  input.value = ''
  document.getElementById('input')!.blur()
  let es = await fetch(
    "https://gptapi.crooi.io/v1/chat/completions",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + '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',
      },
      method: "POST",
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-0301',
        // prompt: prompt,
        // temperature: 0.6,
        // max_tokens: 1200,
        messages: [{"role": "user", "content": prompt}],
        stream: true,
      }),
    }
  )

  const reader = es.body?.pipeThrough(new TextDecoderStream()).getReader()

  while (true) {
    const res = await reader?.read()
    if (res?.done){
      done.value = true
      break
    }
    done.value = false
    let chunk: any = res?.value
    chunk = chunk.replace(/data: /g, '').split('\n')
    chunk.map((item:any, index:any)=>{
      if(item != '[DONE]' && item != '') {
        let json = JSON.parse(item)
        if(json.choices[0].delta.content == undefined) return
        json.choices[0].delta.content = json.choices[0].delta.content.replace(/\n/g, '<br>')
        json.choices[0].delta.content = json.choices[0].delta.content.replace(/ /g, '&nbsp;')
        msg.value += json.choices[0].delta.content
      }else if(item == '[DONE]') {
        msg.value += '<br><br>'
      }
    })
  }
}

// function getMsg(chunk:any) {
//   chunk = chunk.replace(/data: /g, '')
//   chunk = chunk.split('\n')
//   for(let i = 0; i < chunk.length; i++) {
//     if(chunk[i] != '[DONE]' && chunk[i] != '') {
//       let json = JSON.parse(chunk[i])
//       json.choices[0].text = json.choices[0].text.replace(/\n/g, '<br>')
//       json.choices[0].text = json.choices[0].text.replace(/ /g, '&nbsp;')
//       msg.value += json.choices[0].text
//     }else if(chunk[i] == '[DONE]'){
//       msg.value += '<br><br>'
//     }
//   }
// }

function getMsg(chunk:any) {
  chunk = chunk.replace(/data: /g, '')
  chunk = chunk.split('\n')

  for(let i = 0; i < chunk.length; i++) {
    if(chunk[i] == '') return
    let json = JSON.parse(chunk[i])
    if(json == '' || json == undefined || json.choices[0].delta.content == undefined) return
    if(json.choices[0].finish_reason != 'stop') {
      json.choices[0].delta.content = json.choices[0].delta.content.replace(/\n/g, '<br>')
      json.choices[0].delta.content = json.choices[0].delta.content.replace(/ /g, '&nbsp;')
      json.choices[0].delta.content = json.choices[0].delta.content.replace(/</g, '&lt;')
      json.choices[0].delta.content = json.choices[0].delta.content.replace(/>/g, '&gt;')
      msg.value += json.choices[0].delta.content
    }else{
      msg.value += '<br><br>'
    }
  }
}

function onEnterKey(event: any) {
  if (event.keyCode === 13 || event.key === 'Enter') {
    gpt()
  }
}

function clear() {
  msg.value = ''
  guideShow.value = true
}

setInterval(() => {
  // msg.value = msg.value.replace(/🤖️&nbsp;？<br><br><br>/g, '🤖️&nbsp;')
  // msg.value = msg.value.replace(/🤖️&nbsp;？<br><br>/g, '🤖️&nbsp;')
  // msg.value = msg.value.replace(/🤖️&nbsp;？<br>/g, '🤖️&nbsp;')
  // msg.value = msg.value.replace(/🤖️&nbsp;？/g, '🤖️&nbsp;')
  msg.value = msg.value.replace(/🤖️&nbsp;<br><br><br><br>/g, '🤖️&nbsp;')
  msg.value = msg.value.replace(/🤖️&nbsp;<br><br><br>/g, '🤖️&nbsp;')
  msg.value = msg.value.replace(/🤖️&nbsp;<br><br>/g, '🤖️&nbsp;')
}, 100)
</script>

<style>
main {
  max-width: 65ch;
  margin: 0 auto;
  padding: 6rem 2rem;
}

a {
  color: rgba(148,163,184,var(--un-text-opacity)) !important;
  text-decoration: none;
}

a:hover {
  text-decoration: underline ;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
}
</style>