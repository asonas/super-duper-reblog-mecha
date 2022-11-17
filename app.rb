require 'sinatra/base'
require './reblog_job'

class EnqueueApp < Sinatra::Base
  post '/queue' do
    url = params[:url]
    if url.blank?
      puts "error"
    else
      ReblogJob.perform_async(url)
    end
  end
end
