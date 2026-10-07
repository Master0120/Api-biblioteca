import { app } from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/database";

const bootstrap = async (): Promise<void> => {
    await connectDB();

    app.listen(env.port, () => {
        console.log(`Server listening on port ${env.port} [${env.nodeEnv}]`);
    });
};

bootstrap().catch((error) => {
    console.error("Failed to start the application:", error);
    process.exit(1);
});
