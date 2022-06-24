import * as adaptor from "./index";

for (const key in adaptor) {
  if (Object.prototype.hasOwnProperty.call(adaptor, key)) {
    (global as unknown as Window)[key] = adaptor[key];
  }
}

