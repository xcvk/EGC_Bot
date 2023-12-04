let myInput
let mySubmit

function setup() {
    createCanvas(400,400)
    myInput = createInput("Enter your number")
    myInput.position(50,200)
    myInput.size(200)

    mySubmit = createButton("Submit!")
    mySubmit.position(275,200)
    mySubmit.mousePressed(mySubmitEvent)
    background(0)
}

function mySubmitEvent() {
    print("Submitted: ", myInput.value())
    print("number + 100:", int(myInput.value() + 100))
}

