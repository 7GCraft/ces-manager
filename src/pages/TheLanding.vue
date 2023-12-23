<template>
  <div id="landing">
    <section id="landing-introduction">
      <div class="landing-section-container px-16 mb-20 pt-0">
        <img src="../assets/ces_logo.png" alt="CES" class="mx-auto my-8" />
        <h5 class="mb-8 text-3xl text-darkGrayishBlue md:text-4xl font-bold">
          An app that allow you to manage everything.
        </h5>
        <p class="max-w-3xl mx-auto leading-9 text-center md:text-xl">
          Manage every aspects of the game in real time with ease. Gone are the
          days where every aspect of the game has to be handled manually. Manage
          everything in this single, multi-functional desktop application.
        </p>
        <div class="mx-auto w-full my-8 md:my-16"></div>
      </div>
    </section>
    <section id="landing-features">
      <div class="landing-section-container px-16 pt-0 mb-20">
        <h5 class="mb-8 text-3xl text-darkGrayishBlue md:text-4xl font-bold">
          Keep track of your game data.
        </h5>
        <p class="max-w-3xl mx-auto leading-9 text-center md:text-xl mb-6">
          The CES manager allows you to add, modify, and delete data
          persistently among different sessions. This data is then saved
          real-time to a persistent SQL database, allowing your data to be
          processed and modified instantly.
        </p>
        <div class="relative flex flex-col md:flex-row md:space-x-2">
          <div class="md:w-1/2 flex flex-col justify-evenly">
            <img src="../assets/ces_showcase_2.png" class="" />
            <img src="../assets/ces_showcase_3.png" class="" />
          </div>
          <div
            class="flex flex-col md:mt-16 space-y-12 pt-10 md:pt-0 text-xl md:w-1/2 md:text-left md:pl-16"
          >
            <!--Item 1-->
            <div>
              <h5 class="mb-2 md:text-2xl font-bold text-darkGrayishBlue">
                Multi-Tab Management
              </h5>
              <p
                class="max-w-3xl mx-auto leading-9 text-base md:text-xl md:mb-6"
              >
                Open up different tabs in the app, each for a different type of
                data. Multi-task between different parts of the game.
              </p>
            </div>
            <!--Item 2-->
            <div>
              <h5 class="mb-2 text-2xl font-bold text-darkGrayishBlue">
                Complete History in Real Time
              </h5>
              <p
                class="max-w-3xl mx-auto text-base leading-9 md:text-xl md:mb-6"
              >
                Retrieve any data that is presistently stored in real-time
                whenever you used the application.
              </p>
            </div>

            <div>
              <h5 class="mb-2 text-2xl font-bold text-darkGrayishBlue">
                Quick Search
              </h5>
              <p class="max-w-3xl mx-auto text-base leading-9 md:text-xl">
                Easily search and manage your game data by following the
                intuitive, self-explanatory UI of the application
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="landing-simplification">
      <div class="landing-section-container px-16 mb-20 pt-0">
        <h3
          class="mb-8 text-3xl md:text-4xl font-bold text-darkGrayishBlue md:text-5xl;"
        >
          Game Mastering Made Simple
        </h3>
        <p class="max-w-3xl mb-6 mx-auto leading-9 text-center md:text-xl">
          Never again will you be feel stressed or distraught managing a
          multi-layered game! Our all-in-one app will allow you to manage every
          single aspect of your game reliably and easily. Do everything with our
          top of the line everything-in-one application.
        </p>
        <img src="../assets/ces_showcase_1.png" class="mx-auto" />
      </div>
    </section>
    <section id="landing-cta">
      <div class="max-w-6xl mx-auto text-center px-16 mb-16 pt-0">
        <h3
          class="mb-8 text-3xl md:text-4xl font-bold text-darkGrayishBlue md:text-5xl;"
        >
          Begin your journey with CES manager now.
        </h3>
        <p class="max-w-3xl mx-auto leading-9 text-center md:text-xl mb-10">
          Press the button below to kick-start your journey with the CES
          manager. This button will instantly bring you into the main CES
          interface.
        </p>
        <button
          type="button"
          href="#landing-cta"
          @click="$emit('landed')"
          class="p-4 px-10 md:px-20 md:py-5 rounded-full shadow-lg bg-cyan-500 text-white duration-200 hover:opacity-80 hover:bg-white hover:text-cyan-500 md:text-2xl"
        >
          Begin
        </button>
      </div>
    </section>
    <footer id="landing-footer" class="bg-gray-50 py-7 md:py-4">
      <div
        class="landing-section-container px-16 py-4 flex flex-col items-center space-y-8 justify-between md:space-y-0 md:flex-row"
      >
        <div class="">
          <img
            src="../assets/ces_logo.png"
            alt="50"
            class="cursor-pointer h-24 hover:scale-110"
          />
        </div>

        <div
          class="flex flex-col items-center justify-between mb-10 space-y-6 md:flex-row md:mb-0 md:space-y-0 md:space-x-10"
        >
          <a
            href="https://github.com/7GCraft/ces-manager"
            class="hover:font-semibold"
            >Main Github Page</a
          >
          <a
            href="https://github.com/7GCraft/ces-manager/blob/master/images/screenshot.jpg"
            class="hover:font-semibold"
            >Showcase</a
          >
          <a
            href="https://github.com/7GCraft/ces-manager/blob/master/README.md"
            class="hover:font-semibold"
            >Readme</a
          >
        </div>
        <a
          class="rounded-full hover:bg-purple-800"
          href="https://github.com/7GCraft/ces-manager"
          ><img src="../assets/logo-github.png" class="h-20"
        /></a>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: "the-landing",
  emits: ["landed"],
};
</script>
