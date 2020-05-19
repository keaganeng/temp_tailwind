import React from 'react';
import DoenetRenderer from './DoenetRenderer';

export default class Line extends DoenetRenderer {
  constructor(props) {
    super(props)

    if (props.board) {
      this.createGraphicalObject();

      this.doenetPropsForChildren = { board: this.props.board };
      this.initializeChildren();
    }
  }

  static initializeChildrenOnConstruction = false;

  createGraphicalObject() {

    if(this.doenetSvData.numericalPoints.length !== 2) {
      return;
    }

    //things to be passed to JSXGraph as attributes
    var jsxLineAttributes = {
      name: this.doenetSvData.label,
      visible: !this.doenetSvData.hide,
      withLabel: this.doenetSvData.showLabel && this.doenetSvData.label !== "",
      fixed: this.doenetSvData.draggable !== true,
      layer: 10 * this.doenetSvData.layer + 7,
      strokeColor: this.doenetSvData.selectedStyle.markerColor,
      highlightStrokeColor: this.doenetSvData.selectedStyle.markerColor,
      strokeWidth: this.doenetSvData.selectedStyle.lineWidth,
      dash: styleToDash(this.doenetSvData.selectedStyle.lineStyle),
    };

    if (!this.doenetSvData.draggable) {
      jsxLineAttributes.highlightStrokeWidth = this.doenetSvData.selectedStyle.lineWidth;
    }


    let through = [
      [...this.doenetSvData.numericalPoints[0]],
      [...this.doenetSvData.numericalPoints[1]]
    ];

    this.lineJXG = this.props.board.create('line', through, jsxLineAttributes);

    this.lineJXG.on('drag', function () {
      //board.suspendUpdate();
      this.onDragHandler();
      //board.unsuspendUpdate();
    }.bind(this));

    this.previousWithLabel = this.doenetSvData.showLabel && this.doenetSvData.label !== "";

    return this.lineJXG;

  }

  deleteGraphicalObject() {
    this.props.board.removeObject(this.lineJXG);
    delete this.lineJXG;
  }

  componentWillUnmount() {
    if (this.lineJXG) {
      this.deleteGraphicalObject();
    }
  }


  update({ sourceOfUpdate }) {

    if (!this.props.board) {
      this.forceUpdate();
      return;
    }

    // even lines that are hidden have renderers
    // (or this could be called before createGraphicalObject
    // for dynamically added components)
    // so this could be called even for lines that don't have a JXG line created
    if (this.lineJXG === undefined) {
      return;
    }


    let validCoords = true;

    for (let coords of [this.doenetSvData.numericalPoints[0], this.doenetSvData.numericalPoints[1]]) {
      if (!Number.isFinite(coords[0])) {
        validCoords = false;
      }
      if (!Number.isFinite(coords[1])) {
        validCoords = false;
      }
    }

    this.lineJXG.point1.coords.setCoordinates(JXG.COORDS_BY_USER, this.doenetSvData.numericalPoints[0]);
    this.lineJXG.point2.coords.setCoordinates(JXG.COORDS_BY_USER, this.doenetSvData.numericalPoints[1]);

    let visible = !this.doenetSvData.hide;

    if (validCoords) {
      this.lineJXG.visProp["visible"] = visible;
      this.lineJXG.visPropCalc["visible"] = visible;
      // this.lineJXG.setAttribute({visible: visible})
    }
    else {
      this.lineJXG.visProp["visible"] = false;
      this.lineJXG.visPropCalc["visible"] = false;
      // this.lineJXG.setAttribute({visible: false})
    }

    this.lineJXG.name = this.doenetSvData.label;
    // this.lineJXG.visProp.withlabel = this.showlabel && this.label !== "";

    let withlabel = this.doenetSvData.showLabel && this.doenetSvData.label !== "";
    if (withlabel != this.previousWithLabel) {
      this.lineJXG.setAttribute({ withlabel: withlabel });
      this.previousWithLabel = withlabel;
    }

    this.lineJXG.needsUpdate = true;
    this.lineJXG.update()
    if (this.lineJXG.hasLabel) {
      this.lineJXG.label.needsUpdate = true;
      this.lineJXG.label.update();
    }
    this.props.board.updateRenderer();

  }

  onDragHandler() {
    this.actions.moveLine({
      point1coords: [this.lineJXG.point1.X(), this.lineJXG.point1.Y()],
      point2coords: [this.lineJXG.point2.X(), this.lineJXG.point2.Y()],
    });
  }

  componentDidMount() {
    if (!this.props.board) {
      window.MathJax.Hub.Config({ showProcessingMessages: false, "fast-preview": { disabled: true } });
      window.MathJax.Hub.processSectionDelay = 0;
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, "#" + this.componentName]);
    }
  }

  componentDidUpdate() {
    if (!this.props.board) {
      window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, "#" + this.componentName]);
    }
  }

  render() {

    if (this.doenetSvData.hide) {
      return null;
    }

    if(this.props.board) {
      return <><a name={this.componentName} />{this.children}</>
    }

    let mathJaxify = "\\(" + this.doenetSvData.equation + "\\)";
    return <><a name={this.componentName} /><span id={this.componentName}>{mathJaxify}</span></>
  }
}

function styleToDash(style) {
  if (style === "solid") {
    return 0;
  } else if (style === "dashed") {
    return 2;
  } else if (style === "dotted") {
    return 1;
  } else {
    return 0;
  }
}