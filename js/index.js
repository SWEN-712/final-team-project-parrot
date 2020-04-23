const url =
  "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyBh7Et-4oeMg32_qhiGaaPO8iTL49y1cUY";
const data = {
  requests: [
    {
      image: {
        // This is to work with URLs
        // "source":{
        //   "imageUri":
        //     "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
        // }
        content: "",
      },
      features: [
        {
          type: "LABEL_DETECTION",
          maxResults: 3,
        },
      ],
    },
  ],
};
const azureKey = "67c784f91bb84c77b9229d1abbee12c5";
const azureUrl =
  "https://westcentralus.api.cognitive.microsoft.com/vision/v2.1/analyze?visualFeatures=Description";
let imagepath = "";
let imageFile = "";

// ########## Listeners
//Display Image preview
$("#inputImage").on("change", function () {
  encodeBase64(this);
  if (typeof FileReader != "undefined") {
    var image_holder = $("#preview");
    image_holder.empty();

    var reader = new FileReader();
    reader.onload = function (e) {
      $("<img />", {
        src: e.target.result,
        class: "thumb-image",
      }).appendTo(image_holder);
    };
    image_holder.show();
    imageFile = $(this)[0].files[0];
    reader.readAsDataURL($(this)[0].files[0]);
  } else {
    alert("This browser does not support FileReader.");
  }
});

$("#uploadButton").on("click", function () {
  getNounsGoogle();
  getCaptionMicrosoft();
  getCaptionIBM();
});

// ######### Functions
//encode to Base64
function encodeBase64(elm) {
  const file = elm.files[0],
    imgReader = new FileReader();

  imgReader.onloadend = function () {
    // console.log('Base64 Format', imgReader.result);
    imagepath = imgReader.result.split(",")[1];
  };
  imgReader.readAsDataURL(file);
}
function fileImage(elm) {
  const file = elm.files[0],
    imgReader = new FileReader();

  imgReader.onloadend = function () {
    imagepath = imgReader.result.split(",")[1];
  };
  imgReader.readAsDataURL(file);
}

//Get IBM API data
function getCaptionIBM() {
  var output = document.getElementById("output");
  document.getElementById("uploadButton").onclick = function () {
    var data = new FormData();
    data.append("image", document.getElementById("inputImage").files[0]);

    axios
      .post(
        "http://max-image-caption-generator.max.us-south.containers.appdomain.cloud/model/predict",
        data
      )
      .then(function (res) {
        var alttext = res.data.predictions[0].caption;
        document.getElementById("IBMalt").value = alttext;
      })
      .catch(function (err) {
        output.className = "container text-danger";
        output.innerHTML = err.message;
      });
  };
}

//Get Google API data
function getNounsGoogle() {
  data.requests[0].image.content = imagepath;
  axios({
    method: "POST",
    url: url,
    data: data,
  })
    .then((data) => {
      const rawData = data.data.responses[0].labelAnnotations,
        tags = rawData.map((annotation) => annotation.description);

      $("#generatedNouns").val(tags.join());
    })
    .catch((err) => console.log(err));
}

//Get Mirosoft API data
function getCaptionMicrosoft() {
  let formData = new FormData();
  formData.append("data", imageFile);

  axios({
    method: "POST",
    url: azureUrl,
    headers: {
      "Ocp-Apim-Subscription-Key": azureKey,
    },
    data: formData,
  })
    .then((res) => {
      if (res && res.data.description.captions[0]) {
        $("#AzureAlt").val();
        document.getElementById("AzureAlt").value =
          res.data.description.captions[0].text;
      }
    })
    .catch((e) => console.log("Error getting Microsoft description", e));
}

// #### Tooltips
//copy text
function copyText() {
  var copyText = $("#altBuilding");
  copyText.select();
  document.execCommand("copy");
  var tooltip = $("#myTooltip");
  tooltip.html("Copied: " + copyText.val());
}

//Display tooltip changes
function outFunc() {
  var tooltip = $("#myTooltip");
  tooltip.html("Copy to clipboard");
}
