import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';



  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req, res) => {
    const image_url = req.query.image_url;

    if (!image_url) {
        return res.status(400).send("Bad Request: Image URL parameter is missing.");
    }

    try {
        new URL(image_url);
    } catch (error) {
        console.error("Invalid URL:", error);
        return res.status(400).send("Bad Request: Invalid URL.");
    }

    try {
        const filteredImage = await filterImageFromURL(image_url);

        res.status(200).sendFile(filteredImage, {}, async (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).send("Error sending file.");
            }
            try {
                await deleteLocalFiles([filteredImage]);
            } catch (deleteError) {
                console.error("Error deleting file:", deleteError);
            }
        });
    } catch (error) {
        console.error("Error processing image:", error);
        res.status(500).send("Unexpected error occurred, please check server logs.");
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
