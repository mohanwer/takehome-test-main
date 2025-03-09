import {createAppSettingsFromEnv} from "./settings";
import {createApp} from "./app";

const settings = createAppSettingsFromEnv();

export const app = createApp(settings);

app.listen(settings.app.port, () => {
  console.log(`Server is running at http://localhost:${settings.app.port}`);
});
