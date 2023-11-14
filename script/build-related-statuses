#!/usr/bin/env ruby
# frozen_string_literal: true

# Generates _data/related_posts.yml using LSI (not available via GitHub Pages)

require 'jekyll'
require 'psych'

module Jekyll
  class RelatedPosts
    def build
      #return [] unless site.posts.docs.size > 1

      if site.lsi
        build_index
        lsi_related_posts
      else
        most_recent_posts
      end
    end

    def build_index
      self.class.lsi ||= begin
        lsi = ClassifierReborn::LSI.new(:auto_rebuild => false)
        Jekyll.logger.info("Populating LSI...")

        site.collections["statuses"].docs.each do |x|
          lsi.add_item(x)
        end

        Jekyll.logger.info("Rebuilding index...")
        lsi.build_index
        Jekyll.logger.info("")
        lsi
      end
    end
  end
end

options = {
  'source' => File.expand_path('../', __dir__),
  'lsi' => true
}

config = Jekyll.configuration(options)
site = Jekyll::Site.new(config)

site.reset
site.read
site.collections['statuses'].docs.delete_if { |doc| doc.data["retweeted"] || doc.data["reply"] }

relations = {}
site.collections['statuses'].docs.each do |status|
  relations[status.relative_path] = status.related_posts.map(&:relative_path)
end

yaml = Psych.dump(relations, indentation: 2).gsub(/^- /, '  - ')
File.write '_data/related_posts.yml', yaml