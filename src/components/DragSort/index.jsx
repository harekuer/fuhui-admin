import React from 'react'
import { DndProvider } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

const DragAndDropHOC = props => {
  return <React.Fragment>
    {props.children}
  </React.Fragment>
};

export default DndProvider(HTML5Backend)(DragAndDropHOC)