require 'sinatra'
require './reblog_job'

post '/queue' do
  url = params[:url]
  ReblogJob.perform_async(url)
end
