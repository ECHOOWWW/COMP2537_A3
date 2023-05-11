const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];
let filtered_pokemons = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(numPages, currentPage + 2);
  if (currentPage > 1) {
    $("#pagination").append(
      `<button class = "btn btn-link firstButton" value = "1"> First </button> `
    );
    $("#pagination").append(
      `<button class = "btn btn-link prevButton"> Prev </button>`
    );
  }
  for (let i = startPage; i <= endPage; i++) {
    $("#pagination").append(`
    <button class="btn ${
      i === currentPage ? "btn-primary" : "btn-light"
    } page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
  }
  if (currentPage < numPages) {
    $("#pagination").append(
      `<button class = "btn btn-link nextButton"> Next </button> `
    );
    $("#pagination").append(
      `<button class = "btn btn-link lastButton" value = "numPages"> Last </button>`
    );
  }
};

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  pokemons.sort((a, b) => a.id - b.id);
  $("#pokeCards").empty();
  for (let i = 0; i < selected_pokemons.length; i++) {
    const pokemon = selected_pokemons[i];
    const res = await axios.get(pokemon.url);
    $("#pokeCards").append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `);
  }
};

const filterDiv = async () => {
  $("#filter").empty();
  let response = await axios.get("https://pokeapi.co/api/v2/type");
  types = response.data.results;
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    $("#filter").append(`
    <div class = "filterContainer">
    <input type="checkbox" id=${i} name=${type.name} value=${type.name} class = "checkbox">
    <label for=${type.name} class = "label"> ${type.name} </label></div>
    `);
  }
};

const numberDiv = (currentPage, PAGE_SIZE, sum) => {
  $("#number").empty();
  var current = 10;
  if (currentPage < Math.ceil(sum / PAGE_SIZE)) {
    current = 10;
  } else {
    current = sum - (currentPage - 1) * PAGE_SIZE;
  }
  $("#number").append(`
    <h2>
    Showing ${current} of ${sum} pokemons
    </h2>
    `);
};

const setup = async () => {
  // test out poke api using axios here
  $("#pokeCards").empty();
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
  filterDiv();
  numberDiv(currentPage, PAGE_SIZE, pokemons.length);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name);
    // console.log("types: ", types);
    $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities
          .map((ability) => `<li>${ability.ability.name}</li>`)
          .join("")}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats
          .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
          .join("")}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join("")}
          </ul>
      
        `);
    $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `);
  });
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
    paginate(currentPage, PAGE_SIZE, pokemons);
  });

  $("body").on("click", ".firstButton", async function (e) {
    currentPage = Number(e.target.value);
    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
    paginate(currentPage, PAGE_SIZE, pokemons);
  });

  $("body").on("click", ".prevButton", async function (e) {
    currentPage -= 1;
    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
    paginate(currentPage, PAGE_SIZE, pokemons);
  });

  $("body").on("click", ".nextButton", async function (e) {
    currentPage += 1;
    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
    paginate(currentPage, PAGE_SIZE, pokemons);
  });

  $("body").on("click", ".lastButton", async function (e) {
    currentPage = Math.ceil(pokemons.length / PAGE_SIZE);
    paginate(currentPage, PAGE_SIZE, pokemons);
    updatePaginationDiv(currentPage, Math.ceil(pokemons.length / PAGE_SIZE));
  });
};

$(document).ready(setup);

let response = axios.get(
  "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
);
pokemons = response.data;

const filter = async ({ typeNames }) => {
  typeNames.forEach(async (typeName) => {
    for (let i = pokemons.length - 1; i >= 0; i--) {
      const pokemon = pokemons[i];
      let res = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
      );
      let matchesFilter = false;
      res.data.types.forEach((type) => {
        if (type.type.name === typeName) {
          matchesFilter = true;
        }
      });
      if (!matchesFilter) {
        // Remove the current pokemon from the `pokemons` array
        pokemons.splice(i, 1);
      }
    }
  });

  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
  numberDiv(PAGE_SIZE, currentPage, pokemons.length);
};

$(document).ready(function () {
  const typeNames = [];

  $("body").on("change", ".checkbox", function (e) {
    typeNames.length = 0; // clear the array

    $(".checkbox:checked").each(function () {
      typeNames.push($(this).val());
    });

    filter({ typeNames });
  });
});
