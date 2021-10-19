const productList = document.querySelector(".product-list");
const productDetail = document.querySelector(".product-detail-view");
const productTitle = document.querySelector(".product-title");
const productRating = document.querySelector(".product-rating-number");
const addReviewPopup = document.getElementById("addReviewPopup");
const reviewList = document.querySelector(".review-list");
const productRatingStars = document.querySelector(".product-rating-stars");
const noReviewsSection = document.querySelector(".no-reviews");
const ratingStarForm = document.querySelector(".rating-star-form-section");
const reviewText = document.getElementById("productReview");

let newReviewText = "";
let newRating = 0;
let selectedProductId = "";
let selectedProductReviewList = [];

const productsEndpoint =
  "https://1ull7204d9.execute-api.ap-south-1.amazonaws.com/dev/products/";
const reviewsEndpoint =
  "https://sasxhpisr2.execute-api.ap-south-1.amazonaws.com/dev/reviews/";

window.addEventListener("load", (event) => {
  fetchProductList();
});

window.onclick = function (event) {
  if (event.target === addReviewPopup) {
    closeAddReviewPopup();
  }
};

const fetchProductList = async () => {
  const productList = (await get(productsEndpoint)) || [];
  for (const item of productList) {
    createProductListItem(item);
  }
};

const createProductListItem = (product) => {
  const productTitle = product.title;
  const productId = product.productId;

  const productNode = document.createElement("div");
  productNode.classList.add("product-item");

  const text = document.createTextNode(productTitle);

  const expandButton = document.createElement("button");
  expandButton.id = "product-" + productId;
  expandButton.classList.add("button");
  expandButton.classList.add("product-expand-btn");
  expandButton.addEventListener("click", function () {
    showProductDetails(product);
  });
  const expandButtonText = document.createTextNode(">");
  expandButton.appendChild(expandButtonText);

  productNode.appendChild(text);
  productNode.appendChild(expandButton);

  productList.appendChild(productNode);
};

const showProductDetails = (product) => {
  selectedProductId = product.productId;
  productDetail.style.display = "block";
  productList.style.display = "none";
  productTitle.innerText = product.title;
  fetchProductReviews(product.productId);
};

const fetchProductReviews = async (productId) => {
  const reviewList = (await get(reviewsEndpoint + productId)) || reviewList;

  const reviewsPresent = reviewList.length > 0;

  if (!reviewsPresent) {
    noReviewsSection.style.display = "block";
    return;
  } else {
    selectedProductReviewList = reviewList;
    noReviewsSection.style.display = "none";
    for (const review of reviewList) {
      createReviewListItem(review);
    }
    updateAvgRating(reviewList);
  }
};

const updateAvgRating = (reviewList) => {
  const avgRating = getAvgRating(reviewList);
  productRating.innerText = Math.round(avgRating * 100) / 100;
  removeAllChildNodes(productRatingStars);
  showRatingStars(Math.ceil(avgRating), productRatingStars);
};

const createReviewListItem = (review, position = "bottom") => {
  const reviewNode = document.createElement("div");
  reviewNode.className = "review-item my-3 d-flex align-items-center";

  const ratingStarsDiv = document.createElement("div");
  showRatingStars(review.rating, ratingStarsDiv);

  const ratingNumberDiv = document.createElement("div");
  ratingNumberDiv.innerText = review.rating;
  ratingNumberDiv.className = "review-rating-number";

  const reviewText = document.createElement("div");
  reviewText.innerText = review.reviewText || "";

  reviewNode.appendChild(ratingStarsDiv);
  reviewNode.appendChild(ratingNumberDiv);
  reviewNode.appendChild(reviewText);

  if (position === "bottom") {
    reviewList.appendChild(reviewNode);
  } else {
    reviewList.insertBefore(reviewNode, reviewList.firstChild);
  }
};

const getAvgRating = (reviewList) => {
  let avgRating = 0;
  for (const review of reviewList) {
    avgRating += review.rating;
  }

  return avgRating / reviewList.length;
};

const showRatingStars = (ratingValue, parentNode) => {
  for (let i = 1; i <= 5; i++) {
    const starSpan = document.createElement("span");
    starSpan.className = i <= ratingValue ? "fa fa-star checked" : "fa fa-star";

    parentNode.appendChild(starSpan);
  }
};

const showProductList = () => {
  productDetail.style.display = "none";
  productList.style.display = "block";

  selectedProductId = "";
  selectedProductReviewList = [];
  productRating.innerText = "";
  removeAllChildNodes(reviewList);
  removeAllChildNodes(productRatingStars);
};

const openAddReviewPopup = () => {
  addReviewPopup.style.display = "block";
  reviewText.value = "";
  ratingStarClicked(-1);
};

const closeAddReviewPopup = () => {
  addReviewPopup.style.display = "none";
};

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

const ratingStarClicked = (ratingVal) => {
  newRating = ratingVal;
  let i = 0;
  for (const node of ratingStarForm.childNodes) {
    if (node.nodeName === "SPAN") {
      i++;
      if (i <= ratingVal) {
        node.classList.add("checked");
      } else {
        node.classList.remove("checked");
      }
    }
  }
};

const submitReview = async () => {
  newReviewText = reviewText.value;
  const newReview = await post(reviewsEndpoint + selectedProductId, {
    reviewText: newReviewText,
    rating: newRating,
  });
  selectedProductReviewList.unshift(newReview);
  noReviewsSection.style.display = "none";
  closeAddReviewPopup();
  createReviewListItem(newReview, "top");
  updateAvgRating(selectedProductReviewList);
};

const get = async (endpointId) => {
  const apiResponse = await fetch(endpointId);
  if (apiResponse.ok) {
    const responseData = await apiResponse.json();
    return responseData.data;
  } else {
    return null;
  }
};

const post = async (endpointId, body) => {
  const apiResponse = await fetch(endpointId, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-type": "application/json",
    },
  });
  if (apiResponse.ok) {
    const responseData = await apiResponse.json();
    return responseData.data;
  } else {
    return null;
  }
};
