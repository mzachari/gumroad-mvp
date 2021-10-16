const productList = document.querySelector(".product-list");
const productDetail = document.querySelector(".product-detail-view");
const productTitle = document.querySelector(".product-title");
const productRating = document.querySelector(".product-rating-number");
const addReviewPopup = document.getElementById("addReviewPopup");
const reviewList = document.querySelector(".review-list");
const productRatingStars = document.querySelector(".product-rating-stars");
const noReviewsSection = document.querySelector(".no-reviews");

const productsEndpoint =
  "https://1ull7204d9.execute-api.ap-south-1.amazonaws.com/dev/products/";
const reviewsEndpoint =
  "https://sasxhpisr2.execute-api.ap-south-1.amazonaws.com/dev/reviews/";

window.addEventListener("load", (event) => {
  fetchProductList();
});

window.onclick = function (event) {
  console.log(event.target);
  if (event.target === addReviewPopup) {
    closeAddReviewPopup();
  }
};

const fetchProductList = async () => {
  const apiResponse = await fetch(productsEndpoint);
  const productList = await apiResponse.json();
  for (const item of productList.data) {
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
  productDetail.style.display = "block";
  productList.style.display = "none";
  productTitle.innerText = product.title;
  fetchProductReviews(product.productId);
};

const fetchProductReviews = async (productId) => {
  const apiResponse = await fetch(reviewsEndpoint + productId);
  const reviewList = await apiResponse.json();

  const reviewsPresent = reviewList.data.length > 0;

  if (!reviewsPresent) {
    noReviewsSection.style.display = "block";
    return;
  }
  for (const review of reviewList.data) {
    createReviewListItem(review);
  }

  const avgRating = getAvgRating(reviewList.data);
  productRating.innerText = avgRating;
  showRatingStars(Math.ceil(avgRating), productRatingStars);
};

const createReviewListItem = (review) => {
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

  reviewList.appendChild(reviewNode);
};

const getAvgRating = (reviewList) => {
  let avgRating = 0;
  for (const review of reviewList) {
    avgRating += review.rating;
  }

  return avgRating / reviewList.length;
};

const showRatingStars = (ratingValue, parentNode) => {
  console.log(ratingValue);
  for (let i = 1; i <= 5; i++) {
    const starSpan = document.createElement("span");
    starSpan.className = i <= ratingValue ? "fa fa-star checked" : "fa fa-star";

    parentNode.appendChild(starSpan);
  }
};

const showProductList = () => {
  productDetail.style.display = "none";
  productList.style.display = "block";
  removeAllChildNodes(reviewList);
  removeAllChildNodes(productRatingStars);
};

const openAddReviewPopup = () => {
  addReviewPopup.style.display = "block";
};

const closeAddReviewPopup = () => {
  addReviewPopup.style.display = "none";
};

const removeAllChildNodes = (parent) => {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};
