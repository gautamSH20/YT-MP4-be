import express, { Request, Response } from "express";
import cors from "cors";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { PassThrough } from "stream";

const app = express();
app.use(express.json());
app.use(cors());

app.post(
  "/api/v1/download",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { url } = req.body;

      if (ytdl.validateURL(url)) {
        const audioStream = ytdl(url, { quality: "highestaudio" });

        const ffmpegProcess = ffmpeg(audioStream)
          .setFfmpegPath(ffmpegStatic as string)
          .audioBitrate(128)
          .format("mp3")
          .on("error", (err) => {
            console.error(`something is wrong ${err}`);
            res.status(500).end();
          });
        const stream = new PassThrough();
        const response = ffmpegProcess.pipe(stream);

        res.header(
          "Content-Disposition",
          'attachment; filename="downloaded.mp3"'
        );

        stream.pipe(res);
      } else {
        return res.status(400).json({
          message: "something is wrong",
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: "something is wrong",
      });
    }
  }
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`this is working`);
});
