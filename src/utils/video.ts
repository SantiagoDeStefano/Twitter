import path from 'path'

// Constants
const MAXIMUM_BITRATE = {
  '720': 5 * 10 ** 6,   // 5Mbps
  '1080': 8 * 10 ** 6,  // 8Mbps
  '1440': 16 * 10 ** 6  // 16Mbps
}

// Helpers for dynamic imports
const getExeca = async () => (await import('execa')).execa
const getSlash = async () => (await import('slash')).default

// Utilities
async function runFFprobe(args: string[]) {
  const execa = await getExeca()
  const { stdout } = await execa('ffprobe', args)
  return stdout.trim()
}

export const checkVideoHasAudio = async (filePath: string) => {
  const slash = await getSlash()
  const stdout = await runFFprobe([
    '-v', 'error',
    '-select_streams', 'a:0',
    '-show_entries', 'stream=codec_type',
    '-of', 'default=nw=1:nk=1',
    slash(filePath)
  ])
  return stdout === 'audio'
}

const getBitrate = async (filePath: string) => {
  const slash = await getSlash()
  const stdout = await runFFprobe([
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=bit_rate',
    '-of', 'default=nw=1:nk=1',
    slash(filePath)
  ])
  return Number(stdout)
}

const getResolution = async (filePath: string) => {
  const slash = await getSlash()
  const stdout = await runFFprobe([
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height',
    '-of', 'csv=s=x:p=0',
    slash(filePath)
  ])
  const [width, height] = stdout.split('x').map(Number)
  return { width, height }
}

const getWidth = (targetHeight: number, { width, height }: { width: number, height: number }) => {
  const calculatedWidth = Math.round((targetHeight * width) / height)
  return calculatedWidth % 2 === 0 ? calculatedWidth : calculatedWidth + 1
}

// Encoding
type EncodeParams = {
  inputPath: string
  isHasAudio: boolean
  resolution: { width: number; height: number }
  outputSegmentPath: string
  outputPath: string
  bitrate: { 720: number; 1080: number; 1440: number; original: number }
}

const encodeHLS = async (layers: number[], params: EncodeParams) => {
  const execa = await getExeca()
  const slash = await getSlash()
  const {
    inputPath, isHasAudio, resolution,
    outputSegmentPath, outputPath, bitrate
  } = params

  const args = ['-y', '-i', slash(inputPath), '-preset', 'veryslow', '-g', '48', '-crf', '17', '-sc_threshold', '0']

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i]
    args.push('-map', '0:0')
    if (isHasAudio) args.push('-map', '0:1')
    args.push('-s:v:' + i, `${getWidth(layer, resolution)}x${layer}`)
    args.push('-c:v:' + i, 'libx264')
    args.push('-b:v:' + i, `${bitrate[layer as 720 | 1080 | 1440]}`)
  }

  args.push('-c:a', 'copy', '-var_stream_map')
  args.push(
    layers.map((_, i) => isHasAudio ? `v:${i},a:${i}` : `v:${i}`).join(' ')
  )
  args.push(
    '-master_pl_name', 'master.m3u8',
    '-f', 'hls',
    '-hls_time', '6',
    '-hls_list_size', '0',
    '-hls_segment_filename', slash(outputSegmentPath),
    slash(outputPath)
  )

  await execa('ffmpeg', args, { stdio: 'inherit' })
}

// Main
export const encodeHLSWithMultipleVideoStreams = async (inputPath: string) => {
  const [bitrateRaw, resolution] = await Promise.all([
    getBitrate(inputPath),
    getResolution(inputPath)
  ])

  const parentFolder = path.join(inputPath, '..')
  const outputSegmentPath = path.join(parentFolder, 'v%v/fileSequence%d.ts')
  const outputPath = path.join(parentFolder, 'v%v/prog_index.m3u8')

  const isHasAudio = await checkVideoHasAudio(inputPath)

  const bitrate = {
    720: Math.min(bitrateRaw, MAXIMUM_BITRATE[720]),
    1080: Math.min(bitrateRaw, MAXIMUM_BITRATE[1080]),
    1440: Math.min(bitrateRaw, MAXIMUM_BITRATE[1440]),
    original: bitrateRaw
  }

  let layers: number[] = [720]
  if (resolution.height > 720) layers = [720, 1080]
  if (resolution.height > 1080) layers = [720, 1080, 1440]
  if (resolution.height > 1440) layers = [720, 1080, resolution.height]

  await encodeHLS(layers, {
    bitrate,
    inputPath,
    isHasAudio,
    outputPath,
    outputSegmentPath,
    resolution
  })

  return true
}
