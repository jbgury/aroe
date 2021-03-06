from django import template

from aroe.models import *
from wagtail.wagtailcore.models import Page
from django.template import defaultfilters
import re



register = template.Library()


# Retrieve the top menu of Association and describe the content of this menuitem
@register.assignment_tag(takes_context=True)
def association_menu(context):
	request = context['request']
	association_page_list = AssociationRootPage.objects.live().all()
	menuitems = []
	if len(association_page_list) == 1 :
		menuitems = AssociationTilePage.objects.live().descendant_of(association_page_list[0])
	return menuitems

#Retrieve the top menu of Dossiers and describes the content of this menuitem
@register.assignment_tag(takes_context=True)
def dossier_menu(context):
	dossier_page = context['self']
	menuitems = []
	dossieritems = []
	if dossier_page :
		menuitems = ArticlePage.objects.live().child_of(dossier_page)
		dossieritems = DossierPage.objects.live().child_of(dossier_page)
		context['articleitems'] = menuitems
		context['dossieritems'] = dossieritems
	return menuitems


@register.assignment_tag(takes_context=True)
def article_menu(context):
	dossier_page = DossierPage.objects.live().ancestor_of(context['self']).last()
	context['dossier']=dossier_page
	menuitems = []
	dossieritems = []
	if dossier_page :
		menuitems = ArticlePage.objects.live().child_of(dossier_page)
		dossieritems = DossierPage.objects.live().child_of(dossier_page)
		context['articleitems'] = menuitems
		context['dossieritems'] = dossieritems
	return menuitems

@register.filter
def determine_dossier_class(value):
	if (value):
		if len(value) <= 12 :
			div = 12/len(value)
			return "col-md-%s col-lg-%s" % (div, div)
		else :
			return "col-md-12 col-lg-12"
	else :
		return ""

@register.assignment_tag(takes_context=True)
def pressbook_menu(context):
	pressbook_categories = PressbookPage.objects.live().all().order_by("title")
	context['pressbook_categories'] = pressbook_categories
	return pressbook_categories

@register.assignment_tag(takes_context=True)
def pressbook_articles(context):
	pressbook_articles = PressbookArticlePage.objects.live().descendant_of(context['self']).order_by('-latest_revision_created_at')
	context['pressbook_articles'] = pressbook_articles
	return pressbook_articles


@register.filter
def pressbook_articles_col_left(articles):
	if(articles):
		sep = len(articles) / 2 + 1
		return articles[:sep]

@register.filter
def pressbook_articles_col_right(articles):
	if (articles):
		sep = len(articles)/2 +1
		return articles[sep:]

@register.filter
def display_extract(page, query):
	if page and query:
		text_search = ""
		for f in (
				field.name for field in page._meta.fields 
				if isinstance(field, (models.CharField, models.TextField))):
			if f in ('path','title','slug', 'url','url_path'):
				continue

			attrf = getattr(page, f)
			if attrf :
				text_search += defaultfilters.strip_tags(attrf)
		p = re.compile(r'(?i)\b%s'%query)
		text_search = p.sub("<b>%s</b>"%query, text_search)
		# Extract around the text
		m = p.search(text_search)
		# Find the sentence of the match
		sentences = [s+'.' for s in text_search.split('.') if query in s][:3]
		extract = ""
		for e in sentences :
			if not text_search.startswith(e):
				extract += "..." + e
			else :
				extract += e
		if len(sentences) > 0:
			if not text_search.endswith(sentences[-1]):
				extract += "..."
		return extract
	return ""

@register.filter
def display_path(page):
	if page :
		path = ""
		first = False
		for ancestor in page.get_ancestors():
			if first :
				path += " > "
			if isinstance(ancestor.specific, HomePage):
				continue
			if ancestor.title == 'Root':
				continue
			path += ancestor.title
			first= True
		return path
	return ""