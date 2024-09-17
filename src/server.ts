import { app } from './app'
import { env } from './env'

app.listen(
  {
    port: env.PORT,
  },
  (error, address) => {
    if (error) {
      app.log.error(error)
      process.exit(1)
    }

    console.log(`listening on ${address} 🔥`)
  },
)
