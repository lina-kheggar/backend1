gsap.registerPlugin(SplitText, ScrollTrigger, Flip);

let wrapper = document.querySelector(".Horizontal");
let text = document.querySelector(".Horizontal__text");
let split = SplitText.create(".Horizontal__text", { type: "chars, words" });

const scrollTween = gsap.to(text, {
  xPercent: -60,
  ease: "none",
  scrollTrigger: {
    trigger: ".comparisonSection",
    start: "center center",
    end: () => "+=" + document.querySelector(".comparisonSection").offsetWidth,
    scrub: true
  }
});


split.chars.forEach((char) => {
  gsap.from(char, {
    yPercent: 60,
    ease: "power2.out",
    scrollTrigger: {
      trigger: char,
      containerAnimation: scrollTween,
      start: "left 100%",
      end: "left 55%",
      scrub: 1
    }
  });
});

gsap.from(".next h2", {
  opacity: 0,
  y: 80,
  scrollTrigger: { trigger: ".next", start: "top 70%" }
});


gsap.utils.toArray(".comparisonSection").forEach(section => {
	let tl = gsap.timeline({
			scrollTrigger: {
				trigger: section,
				start: "center center",
        // makes the height of the scrolling (while pinning) match the width, thus the speed remains constant (vertical/horizontal)
				end: () => "+=" + section.offsetWidth, 
				scrub: true,
				pin: true,
        anticipatePin: 1
			},
			defaults: {ease: "none"}
		});
	// animate the container one way...
	tl.fromTo(section.querySelector(".afterImage"), { xPercent: 100, x: 0}, {xPercent: 0})
	  // ...and the image the opposite way (at the same time)
	  .fromTo(section.querySelector(".afterImage img"), {xPercent: -100, x: 0}, {xPercent: 0}, 0);
});

console.clear(); // Start with a clean console on refesh

const slider = document.querySelector(".slider");
const items = gsap.utils.toArray(".item");
const offset = 30;


function moveCard() {
  const lastItem = slider.querySelector(".item:last-child");

  if (slider && lastItem) {
    lastItem.style.display = "none"; // Hide the last item
    const newItem = document.createElement("img");
    newItem.className = lastItem.className; // Set the same class name
    newItem.src = lastItem.src; // Set the same class name
    slider.insertBefore(newItem, slider.firstChild); // Insert the new item at the beginning of the slider
  }
}

document.body.addEventListener("click", (e) => {
  let state = Flip.getState(".item");

  moveCard();

  Flip.from(state, {
    targets: ".item",
    ease: "sine.inOut",
    absolute: true,
    onEnter: (elements) => {
      return gsap.from(elements, {
        duration: 0.3,
        yPercent: 20,
        opacity: 0,
        ease: "expo.out"
      });
    },
    onLeave: (element) => {
      return gsap.to(element, {
        duration: 0.3,
        yPercent: 5,
        xPercent: -5,
        transformOrigin: "bottom left",
        opacity: 0,
        ease: "expo.out",
        onComplete () {
          console.log("logging", element[0])
          slider.removeChild(element[0]);
        }
      });
    }
  });
});


