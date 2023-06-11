import { createContext, Dispatch, SetStateAction } from "react";
import { ScaledObjectPayload } from "../models/ScaledObjectPayload";
import React from "react";

interface ScaledObjectContextType {
  scaledObject: ScaledObjectPayload | undefined;
  setScaledObject: Dispatch<SetStateAction<ScaledObjectPayload | undefined>>;
}

const ScaledObjectContext = createContext<ScaledObjectContextType | undefined>(
  undefined
);

export default ScaledObjectContext;
