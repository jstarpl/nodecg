import React, { JSX } from 'react'
import { ITemplate, TemplateValueType } from "../../common/ITemplate";
import fastId from "common/fastId";
import { OnAirToggleButton } from "../lib/OnAirToggleButton";

const getId = fastId();

export function useToggleOnAir<K extends TemplateValueType, T extends ITemplate<K>>(
    template: T,
    setTemplate: (template: T) => void, templateDuration: number = 1000
): {
    OnAirToggleButton: () => JSX.Element
} {
    function toggleOnAir() {
        const isOnAir = !template.onAir;
        setTemplate({
            ...template,
            // Generate a new id when onAir is going to be true
            // This allows us to quickly identify if a given playlist item is playing or if it's a different one
            id: isOnAir ? getId() : template.id,
            onAir: isOnAir,
        });
    }

    const wrappedOnAirToggleButton = () => {
        return ( 
            <OnAirToggleButton
                onAir={template.onAir}
                onClick={toggleOnAir}
                duration={templateDuration}
            />
        )
    }

    return {
        OnAirToggleButton: wrappedOnAirToggleButton
    }
}