class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }

  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }


  set value(value) { // ustawianie nowej wartości widgetu
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);

    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      // console.log(newValue);
      // console.log(thisWidget.correctValue);
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }

    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  // metoda parse value przekształca wartość którą chcemy usawić na odpowiedni typ lub format
  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value);
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
