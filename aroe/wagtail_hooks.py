from django.core.urlresolvers import reverse
from wagtail.wagtailadmin.menu import MenuItem
from django.http import HttpResponse
from django.conf.urls import url
from wagtail.wagtailcore import hooks
from django.utils.translation import ugettext_lazy as _
from django.shortcuts import render
from django.conf import settings

from django.contrib.auth.decorators import permission_required
from core.utils.urlpatterns import decorate_urlpatterns



## Members management
def membres_admin_view( request ):
	panels = [
	]
	for fn in hooks.get_hooks('construct_homepage_panels'):
		fn(request, panels)
	
	return render(request, "aroe/admin/membres_management.html", {
		'site_name': settings.WAGTAIL_SITE_NAME,
		'panels': sorted(panels, key=lambda p: p.order),
		'user': request.user
	})

@hooks.register('register_admin_menu_item')
def register_members_menu_item():
  return MenuItem(_('Members Management'), reverse('membres'), classnames='icon icon-group', order=100)



## Training management

def training_admin_view(request):
	panels = []
	for fn in hooks.get_hooks('construct_homepage_panels'):
		fn(request, panels)

	return render(request, "aroe/admin/trainings_management.html", {
		'site_name':settings.WAGTAIL_SITE_NAME,
		'panels': sorted(panels, key=lambda p:p.order),
		'user': request.user
		})

@hooks.register('register_admin_menu_item')
def register_training_menu_item():
	return MenuItem(_('Training management'), reverse('trainings'), classnames='icon icon-collapse-up', order=100)





## URLS conf

@hooks.register('register_admin_urls')
def urlconf_time():
	# Add "wagtailadmin.access_admin" permission check
	urlpatterns = [
   		url(r'^membres/$', membres_admin_view, name='membres' ),
   		url(r'^trainings/$', training_admin_view, name='trainings'),
  	]
	urlpatterns = decorate_urlpatterns(urlpatterns,
		permission_required(
			'wagtailadmin.access_admin',
			login_url='wagtailadmin_login'
			)
		)
	return urlpatterns
