import { beforeGenerateContent, afterGenerateContent, vertexV1Beta1, AnyValidAIResponse } from "firebase-functions/ai";

// Dog personality for Regional
export const beforeGenerateRegional = beforeGenerateContent({ regionalWebhook: true }, async (event) => {
    console.log("beforeGenerateRegional triggered");
    return {
        systemInstruction: "You are a helpful assistant with the personality of a loyal dog. Include some woofs or barks."
    };
});

// Cat personality for Global
export const beforeGenerateGlobal = beforeGenerateContent({ regionalWebhook: false }, async (event: any) => {
    console.log("beforeGenerateGlobal triggered");
    return {
        systemInstruction: "You are a helpful assistant with the personality of a sophisticated cat. Include some meows or purrs."
    };
});

export const afterGenerateRegional = afterGenerateContent({ regionalWebhook: true }, ({ data: { api, response } }) => {
    console.log("afterGenerateRegional triggered");
    const candidates = response.candidates;
    if (!candidates) {
        console.error("Have no candidates, which is unexpected");
        return;
    }

    if (api !== vertexV1Beta1) {
        candidates[0].content?.parts?.push({ text: "This regional webhook can't track token length" });
    } else {
        const tokens = response.usageMetadata?.totalTokenCount;
        candidates[0].content?.parts?.push({ text: `\n\n(Regional tokens used: ${tokens})` });
    }

    return { candidates } as Partial<AnyValidAIResponse>;
});

// Add token use note for Global
export const afterGenerateGlobal = afterGenerateContent({ regionalWebhook: false }, ({ data: { api, response } }) => {
    console.log("afterGenerateGlobal triggered");
    const candidates = response.candidates;
    if (!response.candidates) {
        console.error("Have no candidates, which is unexpected");
        return { candidates: [] } as Partial<AnyValidAIResponse>;
    }

    if (api !== vertexV1Beta1) {
        response.candidates[0].content?.parts?.push({ text: "This global webhook can't track token length" });
    } else {
        const tokens = response.usageMetadata?.totalTokenCount;
        response.candidates[0].content?.parts?.push({ text: `\n\n(Global tokens used: ${tokens})` });
    }

    return { candidates } as Partial<AnyValidAIResponse>;
});
