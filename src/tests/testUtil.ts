const mockVoidPromise = () => new Promise<void>((resolve) => {resolve();});
const mockTruePromise = () => new Promise<boolean>((resolve) => {resolve(true);});
const mockFalsePromise = () => new Promise<boolean>((resolve) => {resolve(false);});

export {
    mockVoidPromise,
    mockTruePromise,
    mockFalsePromise
};