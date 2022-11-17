require 'json'
require 'sidekiq-scheduler'
require 'tumblr_client'
require 'fileutils'
require 'rinku'

require 'dotenv'
Dotenv.load('credentials/tumblr')

Tumblr.configure do |config|
  config.consumer_key = ENV["TUMBLR_CONSUMER_KEY"]
  config.consumer_secret = ENV["TUMBLR_CONSUMER_SECRET"]
  config.oauth_token = ENV["TUMBLR_OAUTH_TOKEN"]
  config.oauth_token_secret = ENV["TUMBLR_OAUTH_TOKEN_SECRET"]
end

class RateLimitError < StandardError
end

class ReblogJob
  include Sidekiq::Job
  sidekiq_options log_level: :info
  sidekiq_retry_in do |count, execption|
    case execption
    when RateLimitError
      86400 # 1 day
    end
  end

  def perform(url=nil)
    puts "URL: #{url}"
    return nil if url.nil? # FIXME sidekiq-scheduler
    json = `node scrape.js tweet #{url}`
    Reblog.new(url, json).reblog
  end
end

class Reblog
  attr_accessor :json, :medium, :url

  def initialize(url, json)
    @url = url
    @json = JSON.parse(json)
    detect_media
  end

  def reblog
    contents = []
    medium.each do |media|
      m = Media.new(media)
      m.download
      contents.push m
    end

    res = client.photo(
      ENV["TUMBLR_BLOG_NAME"],
      {
        data: contents.map(&:save_path),
        caption: Rinku.auto_link(@json["full_text"]),
      }
    )
    puts res
    if res["state"] == "published"
      # success
    else
      puts res
      raise RateLimitError
    end
  end

  def detect_media
    @medium = json["extended_entities"]["media"]
  end

  def client
    client = Tumblr::Client.new
  end
end

class Media
  attr_accessor :id, :media_url, :type, :mime, :url, :caption

  def initialize(media)
    @url = media["media_url_https"]
    @type = media["type"]
    @caption = media["full_text"]
  end

  def download
    case type
    when "photo"
      save_photo
    else
      raise "undefined type: " + type + "\n #{url}"
    end
  end

  def detect_mime
  end

  def read
    File.read(save_path)
  end

  def save_dir
    "tmp"
  end

  def filename
    URI.parse(url).to_s.split("/").last
  end

  def save_path
    [save_dir, filename].join("/")
  end

  def save_photo
    system "curl", "--progress-bar", "-o", save_path, url
  end
end
