// Define the configuration settings
const settings = {
  channelslug: "research-nsdsf-kot4a"
};

// Array to store loaded posts
const posts = [];

// Query options
const queryOptions = {
  page: 0,
  direction: "desc",
  sort: "position",
  per: 48
};

// Flag to track loading state
let loading = false;

// Function to fetch posts
const fetchPosts = async () => {
  try {
    const response = await fetch(buildQuery());
    const data = await response.json();
    data.contents.forEach(addPost);
  } catch (error) {
    console.error("Error fetching posts:", error);
    $("#loading").text("Failed to load posts");
  } finally {
    loading = false;
    $("#loading").removeClass("is-visible").addClass("not-visible");
  }
};

// Function to load the next page of posts
const nextPage = () => {
  queryOptions.page++;
  return fetchPosts();
};

// Function to build the API query URL
const buildQuery = () => {
  return `https://api.are.na/v2/channels/${settings.channelslug}/contents?${$.param(queryOptions)}`;
};

// Function to add a post to the page
const addPost = (post) => {
  const template = getTemplate("#postTemplate");
  template.attr("id", post.id);
  const mediacontainer = $("#mediacontainer", template);

  switch (post["class"]) {
    case "Image":
      mediacontainer.html(addImagePost(post));
      break;
    case "Text":
      mediacontainer.html(addTextPost(post));
      break;
    case "Media":
      mediacontainer.html(addMediaPost(post));
      break;
    case "Link":
      mediacontainer.html(addLinkPost(post));
      break;
    default:
      console.log("Unknown post type", post["class"], post);
  }

  posts.push(post);
  $("#posts-container").append(template);
};


const addImagePost = (post) => {
  const imageTemplate = getTemplate("#imageTemplate");
  if (post.generated_title !== "Untitled") {
    $("#post-title", imageTemplate).html(post.generated_title);
  }
  $("#post-desc", imageTemplate).html(post.description_html);
  $("img", imageTemplate).attr("src", post.image.thumb.url);
  $("a", imageTemplate).on('click', function () {
    const img = $("img", imageTemplate);
    const currentSrc = img.attr("src");
    const originalSrc = post.image.display.url;

    if (currentSrc === originalSrc) {
      img.attr("src", post.image.thumb.url);
    } else {
      img.attr("src", originalSrc);
    }

    $(this).toggleClass('large');
    $(this).siblings().toggleClass('hide');
    return false;
  });

  // Add an event listener to handle the Escape key
  $(document).on('keydown', function (event) {
    if (event.key === 'Escape') {
      $("img", imageTemplate).attr("src", post.image.thumb.url);
      $("a", imageTemplate).removeClass('large');
      $("a", imageTemplate).siblings().removeClass('hide');
    }
  });

  return imageTemplate;
};


const addTextPost = (post) => {
  const textTemplate = getTemplate("#textTemplate");
  if (post.generated_title !== "Untitled") {
    $("#post-title", textTemplate).text(post.generated_title);
  }
  $("#post-content", textTemplate).html(post.content_html);
  return textTemplate;
};

const addMediaPost = (post) => {
  const mediaTemplate = getTemplate("#mediaTemplate");
  if (post.generated_title !== "Untitled") {
    $("#post-title", mediaTemplate).html(post.generated_title);
  }
  $("#post-desc", mediaTemplate).html(post.description_html);
  $("#post-content", mediaTemplate).html(post.embed.html);
  $("#post-source", mediaTemplate).html(post.source.url);
  return mediaTemplate;
};

const addLinkPost = (post) => {
  const template = getTemplate("#linkTemplate");
  if (post.generated_title !== "Untitled") {
    $("#post-title", template).html(post.generated_title);
  }
  $("#post-desc", template).html(post.description_html);
  $("img", template).attr("src", post.image.display.url);
  $("#post-source", template).html(post.source.url);
  return template;
};

// Function to get a template
const getTemplate = (type) => {
  const template = $(type).clone();
  return template.attr("id", null);
};

// Add an event listener for scrolling
window.addEventListener("scroll", () => {
  if (posts.length) {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const dif = docHeight - winHeight;
    if (scrollTop > dif - winHeight * 2) {
      if (!loading) {
        loading = true;
        nextPage();
      }
    }
  }
});

// Initialize the script
(() => {
  nextPage();
})();
