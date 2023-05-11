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

const numberDiv = (v, totalPokemonCount) => {
  $("#number").empty();
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(currentPage * PAGE_SIZE, totalPokemonCount);
  const currentPagePokemonCount = endIndex - startIndex;
  $("#number").append(`
    <h2>
      Showing ${currentPagePokemonCount} of ${totalPokemonCount} pokemons
    </h2>
  `);
};

const filter = async ({ typeNames }) => {
  let response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemons = response.data.results;
  const filteredPokemons = [];

  for (let i = 0; i < pokemons.length; i++) {
    const pokemon = pokemons[i];
    let res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`
    );
    let matchesFilter = false;
    let typeNamesArray = res.data.types.map((type) => type.type.name);
    if (typeNames.every((typeName) => typeNamesArray.includes(typeName))) {
      matchesFilter = true;
    }
    if (matchesFilter) {
      filteredPokemons.push(pokemon);
    }
  }
  filtered_pokemons = filteredPokemons;

  paginate(1, PAGE_SIZE, filteredPokemons);
  const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
  updatePaginationDiv(1, numPages);
  numberDiv(currentPage, filteredPokemons.length);
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
  numberDiv(currentPage, pokemons.length);

  let typeNames = [];

  $("body").on("change", ".checkbox", function (e) {
    typeNames = [];
    $(".checkbox:checked").each(function () {
      typeNames.push($(this).val());
    });
    filter({ typeNames });
  });

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

  $(document).on("click", ".firstButton", () => {
    currentPage = 1;
    paginate(
      currentPage,
      PAGE_SIZE,
      filtered_pokemons.length ? filtered_pokemons : pokemons
    );
    updatePaginationDiv(
      currentPage,
      Math.ceil(
        filtered_pokemons.length
          ? filtered_pokemons.length / PAGE_SIZE
          : pokemons.length / PAGE_SIZE
      )
    );
  });

  $(document).on("click", ".prevButton", () => {
    currentPage--;
    paginate(
      currentPage,
      PAGE_SIZE,
      filtered_pokemons.length ? filtered_pokemons : pokemons
    );
    updatePaginationDiv(
      currentPage,
      Math.ceil(
        filtered_pokemons.length
          ? filtered_pokemons.length / PAGE_SIZE
          : pokemons.length / PAGE_SIZE
      )
    );
  });

  $(document).on("click", ".nextButton", () => {
    currentPage++;
    paginate(
      currentPage,
      PAGE_SIZE,
      filtered_pokemons.length ? filtered_pokemons : pokemons
    );
    updatePaginationDiv(
      currentPage,
      Math.ceil(
        filtered_pokemons.length
          ? filtered_pokemons.length / PAGE_SIZE
          : pokemons.length / PAGE_SIZE
      )
    );
  });

  $(document).on("click", ".lastButton", () => {
    console.log(filtered_pokemons);
    currentPage = Math.ceil(
      filtered_pokemons.length
        ? filtered_pokemons.length / PAGE_SIZE
        : pokemons.length / PAGE_SIZE
    );
    paginate(
      currentPage,
      PAGE_SIZE,
      filtered_pokemons.length ? filtered_pokemons : pokemons
    );
    updatePaginationDiv(
      currentPage,
      Math.ceil(
        filtered_pokemons.length
          ? filtered_pokemons.length / PAGE_SIZE
          : pokemons.length / PAGE_SIZE
      )
    );
  });

  $(document).on("click", ".numberedButtons", (e) => {
    currentPage = parseInt(e.target.value);
    paginate(
      currentPage,
      PAGE_SIZE,
      filtered_pokemons.length ? filtered_pokemons : pokemons
    );
    updatePaginationDiv(
      currentPage,
      Math.ceil(
        filtered_pokemons.length
          ? filtered_pokemons.length / PAGE_SIZE
          : pokemons.length / PAGE_SIZE
      )
    );
  });
};

$(document).ready(setup);
