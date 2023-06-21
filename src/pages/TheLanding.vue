<template>
    <div id="landing">
    <section id="landing-introduction">
        <div class="max-w-6xl mx-auto text-center px-16 mb-40 pt-0">
            <img src="../assets/ces_logo.png" alt="CES" class="mx-auto my-8"/>
            <h5 class="mb-8 text-3xl 
            text-darkGrayishBlue md:text-4xl font-bold">An app that allow you to manage everything.</h5>
            <p class="max-w-3xl mx-auto leading-9 text-center md:text-xl">Manage every aspects of the game in real time with ease.
                Gone are the days where every aspect of the game has to be handled manually. Manage everything in this single, multi-functional desktop application.
            </p>
            <div class="mx-auto w-full my-8 md:my-16">
          <a
            href="#landing-features"
            class="p-4 px-10 md:px-20 md:py-8 rounded-full shadow-lg bg-emerald-500 text-white duration-200 
            hover:opacity-80 hover:bg-white hover:text-emerald-500 md:text-2xl" 
          >
            Continue
          </a>
        </div>
        </div>
    </section>
    <section id="landing-features">
        <div class="max-w-6xl mx-auto text-center px-16 mb-40 pt-0">
            <h5 class="mb-8 text-3xl 
            text-darkGrayishBlue md:text-4xl font-bold">Keep track of your game data.</h5>
            <p class="max-w-3xl mx-auto leading-9 text-center md:text-xl">The CES manager allows you to add, modify, and delete data persistently among different sessions. This data is then saved real-time to a persistent SQL database, allowing your data to be processed and modified instantly.
            </p>
            <div class="relative flex flex-col md:flex-row md:space-x-2">
                <div class="md:w-1/2 flex flex-col justify-evenly">
                    <img src="../assets/ces-overview1.png"
                    class=""
                    />
                    <img src="../assets/ces-overview2.png"/>
                </div>
                <div
            class="flex flex-col mt-16 mb-24 space-y-12 
            text-xl md:w-1/2 md:mb-60 md:text-left md:pl-16"
          >
            <!--Item 1-->
            <div>
              <h5 class="mb-2 text-2xl font-bold text-darkGrayishBlue">
                Multi-Tab Management
              </h5>
              <p class="max-w-md text-grayIshBlue">
               Open up different tabs in the app, each for a different type of data. Multi-task between different parts of the game.
              </p>
            </div>
            <!--Item 2-->
            <div>
              <h5 class="mb-2 text-2xl font-bold text-darkGrayishBlue">
                Complete History in Real Time
              </h5>
              <p class="max-w-md text-grayIshBlue">
                Retrieve any data that is presistently stored in real-time whenever you used the application.
              </p>
            </div>

            <div>
              <h5 class="mb-2 text-2xl font-bold text-darkGrayishBlue">
                Quick Search
              </h5>
              <p class="max-w-md text-grayIshBlue">
                Easily search and manage your game data by following the intuitive, self-explanatory UI of the application
              </p>
            </div>
          </div>
            </div>

        </div>
        
    </section>
</div>
</template>