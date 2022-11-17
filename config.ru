require 'sidekiq/web'
require './app'

use Rack::Session::Cookie, secret: File.read("credentials/.session.key"), same_site: true, max_age: 86400
run Rack::URLMap.new('/' => EnqueueApp, '/sidekiq' => Sidekiq::Web)
